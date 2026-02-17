import PublicHeader from '@/app/public/_components/header';
import PublicFooter from '../../_components/footer';

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <>
      <PublicHeader slug={slug} />
      {children}
      <PublicFooter />
    </>
  );
}
