export const getNavigationTabStatus = (pathname: string, tabPath: string) => {
  return pathname === tabPath || (pathname && pathname.startsWith(tabPath + '/')) ? 'selected-nav' : 'unselected-nav';
};

export const getMobileNavigationTabStatus = (pathname: string, tabPath: string) => {
  return pathname === tabPath || (pathname && pathname.startsWith(tabPath + '/'))
    ? 'block rounded-sm bg-gray-900 px-3 py-2 text-base font-medium text-white'
    : 'block rounded-sm px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white';
}
