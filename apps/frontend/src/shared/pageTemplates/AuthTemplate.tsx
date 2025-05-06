import React from 'react';
import Image from 'next/image';
import en from '@/constants/lang/en';

interface AuthTemplateProps {
  children: React.ReactNode;
  title: string;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  title,
}) => {
  return (
    <>
      <section className="bg-gray-50 ">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0  md:h-screen md:mt-0">
          <div className="w-full max-w-lg space-y-6">
            <div className="flex justify-center">
              <div className="text-center flex items-center gap-2">
                <Image
                  src="/images/quick-certify-logo.svg"
                  alt="Quick Certify Logo"
                  width={25}
                  height={25}
                  className="mx-auto"
                  priority
                />
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900  ">
                  {en.common.quickCertify}
                </h1>
              </div>
            </div>

            <div className="w-full bg-white rounded-sm shadow dark:border md:mt-0 sm:max-w-lg xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                  {title}
                </h1>
                {children}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
