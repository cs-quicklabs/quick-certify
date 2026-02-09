import PublicFooter from './_components/footer';
import PublicHeader from './_components/header';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
