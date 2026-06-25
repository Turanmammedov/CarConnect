import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [posts, setPosts]               = useState([])
  const [groups, setGroups]             = useState([])
  const [notifications, setNotifications] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [groupsLoading, setGroupsLoading] = useState(true)

  // --- Posts / Stories ---
  const fetchPosts = useCallback(async () => {
    setPostsLoading(true)
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:user_id ( id, username, full_name, avatar_url,
            cars ( brand, model, year, color, horsepower, mods )
          ),
          story_likes ( user_id )
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Paylaşımlar yüklənmədi:', err)
    } finally {
      setPostsLoading(false)
    }
  }, [])

  // --- Groups ---
  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true)
    try {
      const { data, error } = await supabase
        .from('groups_with_count')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setGroups(data || [])
    } catch (err) {
      console.error('Qruplar yüklənmədi:', err)
    } finally {
      setGroupsLoading(false)
    }
  }, [])

  // --- Notifications ---
  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*, from_profile:from_user(username, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)
      if (error?.code === 'PGRST116' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        return
      }
      setNotifications(data || [])
    } catch (err) {
      // ignore — table may not exist yet
    }
  }, [user])

  useEffect(() => {
    fetchPosts()
    fetchGroups()
  }, [fetchPosts, fetchGroups])

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user, fetchNotifications])

  // --- Real-time posts ---
  useEffect(() => {
    const channel = supabase
      .channel('stories-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, () => fetchPosts())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'stories' }, () => fetchPosts())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchPosts])

  // --- Real-time notifications ---
  useEffect(() => {
    if (!user) return
    let channel
    try {
      channel = supabase
        .channel('notif-realtime')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => fetchNotifications())
        .subscribe((status, err) => {
          if (err) console.warn('Notification realtime not available:', err.message)
        })
    } catch (e) {}
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [user, fetchNotifications])

  // --- Add post ---
  async function addPost({ caption, imageUrl, type = 'post' }) {
    if (!user) return { error: new Error('Giriş edilməyib') }
    const { data, error } = await supabase
      .from('stories')
      .insert({ user_id: user.id, caption, image_url: imageUrl, post_type: type })
      .select()
      .single()
    if (!error) fetchPosts()
    return { data, error }
  }

  // --- Delete post ---
  async function deletePost(postId) {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id)
    if (!error) fetchPosts()
    return { error }
  }

  // --- Like / Unlike ---
  async function toggleLike(storyId) {
    if (!user) return
    const existing = posts.find(p => p.id === storyId)
    const isLiked = existing?.story_likes?.some(l => l.user_id === user.id)
    if (isLiked) {
      await supabase.from('story_likes').delete().eq('story_id', storyId).eq('user_id', user.id)
    } else {
      await supabase.from('story_likes').insert({ story_id: storyId, user_id: user.id })
    }
    fetchPosts()
  }

  // --- Groups ---
  async function joinGroup(groupId) {
    if (!user) return { error: new Error('Giriş edilməyib') }
    const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: user.id })
    fetchGroups()
    return { error }
  }

  async function leaveGroup(groupId) {
    if (!user) return
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id)
    fetchGroups()
  }

  async function createGroup(groupData) {
    if (!user) return { error: new Error('Giriş edilməyib') }
    const { data, error } = await supabase
      .from('groups')
      .insert({ ...groupData, created_by: user.id })
      .select().single()
    if (!error) {
      await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id, role: 'admin' })
      fetchGroups()
    }
    return { data, error }
  }

  // --- Update group (admin only) ---
  async function updateGroup(groupId, updates) {
    if (!user) return { error: new Error('Giriş edilməyib') }
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select().single()
    if (!error) fetchGroups()
    return { data, error }
  }

  // --- Fetch group members with roles ---
  async function fetchGroupMembers(groupId) {
    const { data, error } = await supabase
      .from('group_members')
      .select('user_id, role, profiles:user_id(id, username, full_name, avatar_url)')
      .eq('group_id', groupId)
    return { data: data || [], error }
  }

  // --- Group join request (private gruplar için) ---
  async function sendJoinRequest(groupId) {
    if (!user) return { error: new Error('Giriş edilməyib') }
    const { data: existing } = await supabase
      .from('group_join_requests')
      .select('id, status')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (existing) return { data: existing, error: null }

    const { data, error } = await supabase
      .from('group_join_requests')
      .insert({ group_id: groupId, user_id: user.id })
      .select().single()

    if (!error) {
      const { data: grp } = await supabase.from('groups').select('created_by, name').eq('id', groupId).single()
      if (grp?.created_by) {
        await supabase.from('notifications').insert({
          user_id: grp.created_by,
          from_user: user.id,
          type: 'join_request',
          reference_id: groupId,
          message: `${user.email?.split('@')[0]} qrupa qoşulmaq istəyir: ${grp.name}`,
        }).then(() => {}).catch(() => {})
      }
    }
    return { data, error }
  }

  // --- Accept / Reject join request ---
  async function respondJoinRequest(requestId, groupId, requestUserId, accept) {
    const status = accept ? 'accepted' : 'rejected'
    await supabase.from('group_join_requests').update({ status }).eq('id', requestId)
    if (accept) {
      await supabase.from('group_members').insert({ group_id: groupId, user_id: requestUserId })
      await supabase.from('notifications').insert({
        user_id: requestUserId,
        from_user: user.id,
        type: 'join_accepted',
        reference_id: groupId,
        message: 'Qrupa qoşulma istəyiniz qəbul edildi!',
      }).then(() => {}).catch(() => {})
      fetchGroups()
    }
    fetchNotifications()
  }

  // --- Group messages ---
  async function fetchGroupMessages(groupId) {
    const { data, error } = await supabase
      .from('group_messages')
      .select('*, profiles:user_id(username, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100)
    return { data: data || [], error }
  }

  async function sendGroupMessage(groupId, content) {
    if (!user) return { error: new Error('Giriş edilməyib') }
    return await supabase.from('group_messages').insert({ group_id: groupId, user_id: user.id, content })
  }

  // --- Events ---
  async function fetchGroupEvents(groupId) {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_attendees(user_id)')
      .eq('group_id', groupId)
      .order('event_date', { ascending: true })
    return { data: data || [], error }
  }

  async function createEvent(eventData) {
    if (!user) return { error: new Error('Giriş edilməyib') }
    const { data, error } = await supabase
      .from('events')
      .insert({ ...eventData, created_by: user.id })
      .select().single()
    return { data, error }
  }

  async function toggleEventAttendance(eventId) {
    if (!user) return
    const { data: existing } = await supabase
      .from('event_attendees')
      .select('user_id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (existing) {
      await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', user.id)
    } else {
      await supabase.from('event_attendees').insert({ event_id: eventId, user_id: user.id })
    }
  }

  // --- Direct messages ---
  async function fetchDMs(otherUserId) {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(from_user.eq.${user.id},to_user.eq.${otherUserId}),and(from_user.eq.${otherUserId},to_user.eq.${user.id})`)
      .order('created_at', { ascending: true })
    return { data: data || [], error }
  }

  async function sendDM(toUserId, content) {
    if (!user) return { error: new Error('Giriş edilməyib') }
    return await supabase.from('direct_messages').insert({ from_user: user.id, to_user: toUserId, content })
  }

  // --- Mark notification read ---
  async function markNotifRead(notifId) {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId).then(() => {}).catch(() => {})
    fetchNotifications()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // --- Follow system ---
  async function followUser(targetId) {
    if (!user || targetId === user.id) return
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId }).then(()=>{}).catch(()=>{})
  }

  async function unfollowUser(targetId) {
    if (!user) return
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId)
  }

  async function getFollowStatus(targetId) {
    if (!user) return false
    const { data } = await supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', targetId).maybeSingle()
    return !!data
  }

  async function getFollowCounts(userId) {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ])
    return { followers: followers || 0, following: following || 0 }
  }

  async function searchUsers(query) {
    if (!query?.trim()) return []
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, cars(brand, model, year, color)')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)
    return data || []
  }

  async function getUserProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*, cars(*)')
      .eq('id', userId)
      .single()
    return data
  }

  async function getUserPosts(userId) {
    const { data } = await supabase
      .from('stories')
      .select('*, profiles:user_id(id, username, full_name, avatar_url, cars(brand,model,year,color)), story_likes(user_id)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return data || []
  }

  return (
    <AppContext.Provider value={{
      posts, postsLoading, fetchPosts,
      groups, groupsLoading, fetchGroups,
      notifications, fetchNotifications, markNotifRead, unreadCount,
      addPost, deletePost, toggleLike,
      joinGroup, leaveGroup, createGroup, updateGroup,
      sendJoinRequest, respondJoinRequest,
      fetchGroupMessages, sendGroupMessage,
      fetchGroupEvents, createEvent, toggleEventAttendance,
      fetchGroupMembers,
      fetchDMs, sendDM,
      followUser, unfollowUser, getFollowStatus, getFollowCounts,
      searchUsers, getUserProfile, getUserPosts,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
