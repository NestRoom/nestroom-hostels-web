import { RoomsProvider } from '@/context/RoomsContext';

export default function RoomsLayout({ children }) {
  return <RoomsProvider>{children}</RoomsProvider>;
}
