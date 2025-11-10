// /app/admin/categorias/page.js
import CategoryManager from '../../../components/CategoryManager/CategoryManager';

export default function AdminCategoriesPage() {
  // Este componente de página simplesmente renderiza o gerenciador.
  // Toda a lógica estará no CategoryManager.
  return <CategoryManager />;
}