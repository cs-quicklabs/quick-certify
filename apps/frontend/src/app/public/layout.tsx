import PublicFooter from './company/_components/footer';
import PublicHeader from './company/_components/header';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
