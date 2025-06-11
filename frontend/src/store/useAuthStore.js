import {create} from "zustand"
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data});
        }
        catch (error) {
            set({authUser: null});
            console.log("Error in checkAuth", error);
        }
        finally {
            set({isCheckingAuth: false});
        }
    },

    signup: async (credentials) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", credentials);
            set({ authUser: res.data });
            toast.success("Акаунт створено успішно!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Помилка реєстрації";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (credentials) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", credentials);
            set({ authUser: res.data });
            toast.success("Успішний вхід в систему!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Помилка входу";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Вихід виконано успішно!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Помилка виходу";
            toast.error(errorMessage);
            console.error("Logout error:", error);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Профіль оновлено успішно!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Помилка оновлення профілю";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    // Додаткові утилітарні методи
    clearAuth: () => {
        set({ authUser: null });
    },

    isAuthenticated: () => {
        return !!get().authUser;
    },

    getUserName: () => {
        const user = get().authUser;
        return user?.fullName || user?.email || '';
    },

    getUserEmail: () => {
        const user = get().authUser;
        return user?.email || '';
    }
}));