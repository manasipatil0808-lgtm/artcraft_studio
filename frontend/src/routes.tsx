import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Shop } from "./pages/Shop";
import { ProductDetails } from "./pages/ProductDetails";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderSuccess } from "./pages/OrderSuccess";
import { MyOrders } from "./pages/MyOrders";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboard } from "./pages/AdminDashboard";
import { NotFound } from "./pages/NotFound";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetails },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "order-success", Component: OrderSuccess },
      { path: "my-orders", Component: MyOrders },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { 
        path: "admin", 
        element: (
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ) 
      },
      { path: "*", Component: NotFound },
    ],
  },
]);