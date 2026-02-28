import React from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { RoleProvider } from "./context/RoleContext";
import "../styles/fonts.css";
import "../styles/theme.css";
export default function App() {
    return (<RoleProvider>
      <RouterProvider router={router}/>
      <Toaster position="top-right" expand={true} richColors toastOptions={{
            style: { borderRadius: '16px' }
        }}/>
    </RoleProvider>);
}
