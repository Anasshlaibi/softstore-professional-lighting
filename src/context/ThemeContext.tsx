import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    // Load theme preference from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        console.log('Toggle theme clicked! Current isDark:', isDark);
        setIsDark((prev) => {
            const newTheme = !prev;
            console.log('New theme will be:', newTheme ? 'dark' : 'light');
            if (newTheme) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                console.log('Added dark class to html element');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                console.log('Removed dark class from html element');
            }
            return newTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
