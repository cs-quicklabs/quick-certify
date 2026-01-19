<<<<<<< HEAD
import DesignFormPage from '../../_components/DesignFormPage';
=======
import DesignFormPage from './../../_components/DesignFormPage';
>>>>>>> 54d24e8 (fix: merge conflict)

export default function EditDesignPage({
  params,
}: {
  params: { id: string };
}) {
  return <DesignFormPage mode="edit" id={params.id} />;
}
