import { createContext, useContext, useState } from 'react';

const BrowseContext = createContext();
const BrowseUpdateContext = createContext();

export function useBrowse() {
    return useContext(BrowseContext);
}

export function useBrowseUpdate() {
    return useContext(BrowseUpdateContext);
}

export function BrowseProvider({children}) {
    const [accType, setAccType] = useState("");

    function updateBrowse(acc) {
        setAccType(acc);
    }

    return (
        <BrowseContext.Provider value={accType}>
            <BrowseUpdateContext.Provider value={updateBrowse}>
               {children} 
            </BrowseUpdateContext.Provider>
        </BrowseContext.Provider>
    )
}