import AdminLayout from '../../components/AdminLayout/AdminLayout';

export default function AdminRootLayout({ children }) {
  // Este layout aplica o componente AdminLayout a todas as páginas dentro de /admin
  return <AdminLayout>{children}</AdminLayout>;
}