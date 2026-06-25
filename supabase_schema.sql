-- ============================================================
-- CarConnect — Supabase Şeması v3 (Mevcut tablolara EK)
-- Yalnız yeni cədvəlləri əlavə edir, eskileri bozmur
-- ============================================================

-- Mövcud cədvəllərə post_type sütunu əlavə et (varsa ignore edilir)
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'post';

-- Group join requests (Katılım İstəkləri)
CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.groups ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected'
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Group messages (Qrup Söhbəti)
CREATE TABLE IF NOT EXISTS public.group_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.groups ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Events (Tədbirlər)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.groups ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES public.profiles ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  location_name text,
  location_lat float,
  location_lng float,
  created_at timestamptz DEFAULT now()
);

-- Event attendees (Katılımcılar)
CREATE TABLE IF NOT EXISTS public.event_attendees (
  event_id uuid REFERENCES public.events ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Direct messages (Özəl Mesajlar)
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  to_user uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Notifications (Bildirişlər)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  from_user uuid REFERENCES public.profiles ON DELETE SET NULL,
  type text NOT NULL, -- 'join_request' | 'join_accepted' | 'like' | 'comment' | 'follow'
  reference_id uuid,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Group join requests
CREATE POLICY IF NOT EXISTS "own_join_requests_select" ON public.group_join_requests
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT created_by FROM public.groups WHERE id = group_id));
CREATE POLICY IF NOT EXISTS "send_join_requests" ON public.group_join_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "owner_update_requests" ON public.group_join_requests
  FOR UPDATE USING (auth.uid() IN (SELECT created_by FROM public.groups WHERE id = group_id));

-- Group messages
CREATE POLICY IF NOT EXISTS "members_see_messages" ON public.group_messages
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.group_members WHERE group_id = group_messages.group_id));
CREATE POLICY IF NOT EXISTS "members_send_messages" ON public.group_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IN (SELECT user_id FROM public.group_members WHERE group_id = group_messages.group_id));

-- Events
CREATE POLICY IF NOT EXISTS "public_events" ON public.events FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "members_create_events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = created_by AND auth.uid() IN (SELECT user_id FROM public.group_members WHERE group_id = events.group_id));

-- Event attendees
CREATE POLICY IF NOT EXISTS "public_attendees" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "own_attendance" ON public.event_attendees FOR ALL USING (auth.uid() = user_id);

-- Direct messages
CREATE POLICY IF NOT EXISTS "own_dms" ON public.direct_messages
  FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user);
CREATE POLICY IF NOT EXISTS "send_dms" ON public.direct_messages
  FOR INSERT WITH CHECK (auth.uid() = from_user);

-- Notifications
CREATE POLICY IF NOT EXISTS "own_notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "insert_notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "mark_read" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── Mövcud stories cədvəlinə group_type sütunu əlavə et ─────────────────────
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS group_type text DEFAULT 'open';

-- ─── Real-time enable ────────────────────────────────────────────────────────
-- Supabase Dashboard > Database > Replication bölümündə bu cədvəlləri əlavə edin:
-- group_messages, notifications, direct_messages

-- ─── Updated view ─────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS public.groups_with_count;
CREATE VIEW public.groups_with_count AS
  SELECT
    g.*,
    count(gm.user_id)::int AS member_count
  FROM public.groups g
  LEFT JOIN public.group_members gm ON gm.group_id = g.id
  GROUP BY g.id;

-- ─── photo_url sütunu cars tablosuna əlavə et ────────────────────────────────
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS photo_url text;

-- ─── notifications cədvəlini yarat (əgər yoxdursa) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  from_user uuid REFERENCES public.profiles ON DELETE SET NULL,
  type text NOT NULL,
  reference_id uuid,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "own_notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "insert_notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "mark_read" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ─── Follows cədvəli (takip sistemi) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id  uuid REFERENCES public.profiles ON DELETE CASCADE,
  following_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_follows"   ON public.follows FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "own_follows_ins"  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY IF NOT EXISTS "own_follows_del"  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ─── stories cədvəlinə post_type əlavə et (əgər yoxdursa) ───────────────────
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'post';
