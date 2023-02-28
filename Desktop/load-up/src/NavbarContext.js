import { createContext, useContext, useState } from 'react';

const NavbarContext = createContext();
const NavbarUpdateContext = createContext();

export function useNavbar() {
    return useContext(NavbarContext);
}

export function useNavbarUpdate() {
    return useContext(NavbarUpdateContext);
}

export function NavbarProvider({children}) {
    const [accType, setAccType] = useState("");

    function updateNavbar(acc) {
        setAccType(acc);
    }

    return (
        <NavbarContext.Provider value={accType}>
            <NavbarUpdateContext.Provider value={updateNavbar}>
               {children} 
            </NavbarUpdateContext.Provider>
        </NavbarContext.Provider>
    )
}