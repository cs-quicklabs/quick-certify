import PublicHeader from '@/app/public/_components/header';

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
    </>
  );
}
