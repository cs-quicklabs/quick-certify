'use client';
import {
  Disclosure,
  DisclosureButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import Image from 'next/image';

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { logoutApiCall } from '@src/apiServices/authService';
import { useState } from 'react';
import ConformationModal from '../modals/ConfirmationModal';

import { getInitials } from '@src/utils/helpers';
import {
  //   adminUserLinks,
  //   editorUserLinks,
  //   memberUserLinks,
  menuItems,
  //   superAdminUserLinks,
  TLink,
} from '@src/utils/navbarHelper';
import en from '@/constants/lang/en';
import { SuperLink } from '@/utils/HiLink';

function Navbar() {
  const [showConformationModal, setShowConformationModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  //   const [isLoading, setIsLoading] = useState(false);

  const user = {
    first_name: 'Madhur',
    last_name: 'Verma',
    email: 'madhur@gmail.com',
    team: { name: 'Team 1' },
    user_type_id: 1,
    profile_image: '',
  };

  async function doLogout() {
    try {
      localStorage.clear();
      await logoutApiCall();
      window.location.href = '/';
    } catch (error) {
      console.log(error);
    }
  }

  const renderMenuItem = (item: TLink) => {
    if (item.isExtended) {
      return (
        <MenuItem key={item.link}>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {item.name}
          </a>
        </MenuItem>
      );
    }

    return (
      <MenuItem key={item.link}>
        <SuperLink
          href={item.link}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          {item.name}
        </SuperLink>
      </MenuItem>
    );
  };

  function renderProfileIcon() {
    if (user?.profile_image) {
      return (
        <Image
          alt=""
          src={user.profile_image}
          className="h-10 w-10 rounded-full object-cover"
          width={40}
          height={40}
        />
      );
    }

    return (
      <span className="text-lg font-medium">
        {getInitials(user?.first_name, user?.last_name)}
      </span>
    );
  }

  return (
    <>
      <ConformationModal
        title={en.common.logoutConformation}
        open={showConformationModal}
        setOpen={setShowConformationModal}
        onConfirm={doLogout}
        cancelText={en.common.no}
        confirmText={en.common.yes}
      />
      <Disclosure
        as="nav"
        className="bg-gray-800 text-white shadow-sm fixed z-10 w-full top-0"
      >
        <div className="mx-auto px-4 sm:px-4 lg:px-8">
          <div className="flex py-2 justify-between align-center">
            <div className="hidden md:flex px-2 lg:px-0">
              <div className="shrink-0 flex items-center">
                {/* <SuperLink
                  id="homeLogo"
                  href={RouteEnum.MY_LEARNING_PATH}
                  className="items-center justify-center text-white font-extrabold font-mono px-3 hidden lg:flex tracking-wider"
                >
                  <WebsiteLogo width="45" />
                  <p className="ml-3">{en.common.quickLearn}</p>
                </SuperLink> */}
                <div className="flex justify-center">
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-whitemd:text-2xl ">
                    {en.common.quickCertify}
                  </h1>
                </div>
                <span className="text-white font-medium px-3 block lg:hidden" />
              </div>
            </div>

            <div className="flex lg:hidden">
              <DisclosureButton
                className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">{en.component.openMenu}</span>
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                )}
              </DisclosureButton>
            </div>

            <div className="hidden lg:ml-4 lg:block">
              <div className="flex items-center">
                {/* Updated Profile Menu */}
                <Menu as="div" className="relative ml-4">
                  <MenuButton className="flex items-center">
                    <div
                      className="h-10 w-10 bg-gray-400 rounded-full flex items-center justify-center"
                      id="headerProfileImage"
                    >
                      {renderProfileIcon()}
                    </div>
                  </MenuButton>

                  <MenuItems className="absolute right-0 mt-2 w-64 divide-y divide-gray-100 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden">
                    {/* User Info Section */}
                    <div className="px-4 py-3">
                      <p className="text-base text-gray-900 font-medium first-letter:uppercase">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.team?.name}
                      </p>
                    </div>

                    {/* Main Menu Items */}
                    <div className="py-1">
                      {user &&
                        menuItems
                          .filter((item) => !item.isExtended)
                          .map((item) =>
                            !item.exclude?.includes(user?.user_type_id)
                              ? renderMenuItem(item)
                              : null
                          )}
                    </div>

                    {/* Extended Menu Items */}
                    <div className="py-1">
                      {menuItems
                        .filter((item) => item.isExtended)
                        .map((item) => renderMenuItem(item))}
                    </div>

                    {/* Sign Out */}
                    <div className="py-1">
                      <MenuItem>
                        <button
                          type="button"
                          onClick={() => setShowConformationModal(true)}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {en.component.signOut}
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>
        </div>
      </Disclosure>
      <div
        style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          height: '3px',
          width: '100%',
          backgroundColor: '#2563eb',
          zIndex: 1000,
          transition: 'width 0.3s ease-out',
        }}
      />
    </>
  );
}

export default Navbar;
