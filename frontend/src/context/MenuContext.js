import React, { createContext, useContext, useEffect, useState } from 'react';
import { menuAPI } from '../services/api';
import { fallbackMenus } from '../data/siteContent';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState(fallbackMenus);
  const [loading, setLoading] = useState(true);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const res = await menuAPI.getMenus();
      setMenus({
        shop: res.menus?.shop?.length ? res.menus.shop : fallbackMenus.shop,
        quick: res.menus?.quick?.length ? res.menus.quick : fallbackMenus.quick,
        help: res.menus?.help?.length ? res.menus.help : fallbackMenus.help,
      });
    } catch {
      setMenus(fallbackMenus);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  return (
    <MenuContext.Provider value={{ menus, loading, refreshMenus: loadMenus }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenus = () => useContext(MenuContext);
