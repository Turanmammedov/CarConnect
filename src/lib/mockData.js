// Demo verileri — Supabase bağlanana kadar kullanılır
export const mockUsers = [
  {
    id: '1',
    username: 'drift_king_az',
    full_name: 'Elçin Məmmədov',
    avatar_url: null,
    bio: 'Toyota MR2 tuner | Baku drift scene 🔥',
    location: { lat: 40.4093, lng: 49.8671 },
    car: {
      brand: 'Toyota', model: 'MR2', year: 1994,
      color: '#FF4500', mods: ['Turbo kit', 'Coilovers', 'Wide body'],
      horsepower: 320, photo_url: null
    }
  },
  {
    id: '2',
    username: 'bmw_fanat',
    full_name: 'Tural Əliyev',
    avatar_url: null,
    bio: 'E46 M3 owner. Track days every weekend.',
    location: { lat: 40.3953, lng: 49.8820 },
    car: {
      brand: 'BMW', model: 'E46 M3', year: 2003,
      color: '#1a1a2e', mods: ['Exhaust', 'Intake', 'Stage 2 tune'],
      horsepower: 400, photo_url: null
    }
  },
  {
    id: '3',
    username: 'stance_baku',
    full_name: 'Nigar Həsənova',
    avatar_url: null,
    bio: 'Golf R | Stanced & slammed 🌸',
    location: { lat: 40.4200, lng: 49.8500 },
    car: {
      brand: 'Volkswagen', model: 'Golf R', year: 2019,
      color: '#silver', mods: ['Airlift', 'Rotiform wheels', 'Tint'],
      horsepower: 310, photo_url: null
    }
  },
  {
    id: '4',
    username: 'jdm_life99',
    full_name: 'Rəşad Quliyev',
    avatar_url: null,
    bio: 'Nissan Skyline R34 | JDM forever',
    location: { lat: 40.3800, lng: 49.8900 },
    car: {
      brand: 'Nissan', model: 'Skyline R34', year: 1999,
      color: '#BADBAD', mods: ['RB26 build', 'HKS GT2 turbo', 'Nismo parts'],
      horsepower: 550, photo_url: null
    }
  },
  {
    id: '5',
    username: 'muscle_az',
    full_name: 'Cavid İsmayılov',
    avatar_url: null,
    bio: 'Camaro SS 2019 | American power 🦅',
    location: { lat: 40.4300, lng: 49.8300 },
    car: {
      brand: 'Chevrolet', model: 'Camaro SS', year: 2019,
      color: '#FFD700', mods: ['Supercharger', 'Exhaust', 'Tune'],
      horsepower: 680, photo_url: null
    }
  },
]

export const mockStories = [
  { id: 's1', user_id: '1', image_url: null, caption: 'Sabah drift practice! Hazır olan var mı? 🔥', created_at: new Date(Date.now() - 3600000).toISOString(), likes: 47, views: 203 },
  { id: 's2', user_id: '2', image_url: null, caption: 'Yeni egzoz taktım. Ses 🔊💀', created_at: new Date(Date.now() - 7200000).toISOString(), likes: 89, views: 341 },
  { id: 's3', user_id: '3', image_url: null, caption: 'Airride falan yok, ama düşük 😂', created_at: new Date(Date.now() - 1800000).toISOString(), likes: 134, views: 512 },
  { id: 's4', user_id: '4', image_url: null, caption: 'R34 hazır. Biri yarışmak ister mi? 👀', created_at: new Date(Date.now() - 5400000).toISOString(), likes: 201, views: 890 },
  { id: 's5', user_id: '5', image_url: null, caption: 'Supercharger kuruldu. 680hp yapıyor! 💪', created_at: new Date(Date.now() - 900000).toISOString(), likes: 312, views: 1204 },
]

export const mockGroups = [
  {
    id: 'g1', name: 'Baku JDM Crew', description: 'Bakının JDM severleri burada toplanır 🇯🇵', 
    member_count: 48, tags: ['JDM', 'Import', 'Tuning'],
    next_meetup: { location: 'Neftçilər pr., Heydər Əliyev Parkı', date: new Date(Date.now() + 86400000 * 2).toISOString(), lat: 40.4050, lng: 49.8670 },
    members: ['1', '4'],
    avatar_color: '#FF4500'
  },
  {
    id: 'g2', name: 'Euro Scene AZ', description: 'Avropa markalarının sevərləri — BMW, Audi, VW, Mercedes', 
    member_count: 67, tags: ['Euro', 'BMW', 'VAG', 'AMG'],
    next_meetup: { location: 'Keşlə Avtovağzalı yanı', date: new Date(Date.now() + 86400000 * 5).toISOString(), lat: 40.3900, lng: 49.8750 },
    members: ['2', '3'],
    avatar_color: '#3B82F6'
  },
  {
    id: 'g3', name: 'Stance Baku', description: 'Low life for life. Fitment, stance, style.',
    member_count: 29, tags: ['Stance', 'Fitment', 'Static', 'Air'],
    next_meetup: { location: 'ICR Yanındaki Torpaq Sahəsi', date: new Date(Date.now() + 86400000 * 1).toISOString(), lat: 40.4200, lng: 49.8560 },
    members: ['3'],
    avatar_color: '#8B5CF6'
  },
  {
    id: 'g4', name: 'Drift AZ Official', description: 'Azərbaycanda drift hərəkatının rəsmi qrupu 🚗💨',
    member_count: 112, tags: ['Drift', 'Track', 'Competition'],
    next_meetup: { location: 'Bakcell Arena Parking', date: new Date(Date.now() + 86400000 * 3).toISOString(), lat: 40.4093, lng: 49.9200 },
    members: ['1', '4', '5'],
    avatar_color: '#EF4444'
  },
]

export const mockCurrentUser = {
  id: 'me',
  username: 'senim_username',
  full_name: 'Sən',
  avatar_url: null,
  bio: 'Araba tutkunum var 🚗',
  joined_groups: ['g1', 'g3'],
  car: null
}
