import { FC, ReactNode, createContext, useContext, useState } from "react";

interface ModalContextType {
    isVisible: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
    isVisible: false,
    openModal: () => {},
    closeModal: () => {}
});

interface ModalContextProviderProps {
    children: ReactNode;
}

export const ModalContextProvider: FC<ModalContextProviderProps> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);

    const openModal = () => setIsVisible(true);
    const closeModal = () => setIsVisible(false);

    const value = {
        isVisible,
        openModal,
        closeModal
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModalContext = () => {
    const { isVisible, openModal, closeModal } = useContext(ModalContext);
    return {
        isVisible,
        openModal,
        closeModal
    };
};
