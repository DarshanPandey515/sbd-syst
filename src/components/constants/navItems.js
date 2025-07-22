import {
  Home,
  Calendar,
  Users,
  Trophy,
  UserCheck,
  Building,
  Settings
} from 'lucide-react';

const navItems = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Meets', icon: Calendar, href: '/meets' },
  { name: 'Venues', icon: Building, href: '/venues' },
  { name: 'Category', icon: UserCheck, href: '/weight-classes' },
  { name: 'Settings', icon: Settings, href: '/settings' },
  
];

export default navItems;
