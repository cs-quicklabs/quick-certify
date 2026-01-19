
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a7d6645 (fix: conflict)
// import { useEffect, useState } from "react";
// import {
//   getDesign,
//   createDesign,
//   updateDesign,
// } from "@/services/api/design.service";
// import { DesignPayload, Design } from "@/types/design.types";
<<<<<<< HEAD

// export function useDesign(id?: string) {
//   const [data, setData] = useState<Design | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!id) return;

//     setLoading(true);
//     getDesign(id)
//       .then(setData)
//       .finally(() => setLoading(false));
//   }, [id]);

//   return { data, loading };
// }

// export function useSaveDesign(mode: "add" | "edit", id?: string) {
//   const [loading, setLoading] = useState(false);

//   const save = async (payload: DesignPayload) => {
//     setLoading(true);
//     try {
//       mode === "add"
//         ? await createDesign(payload)
//         : await updateDesign(id!, payload);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { save, loading };
// }
=======
import { useEffect, useState } from "react";
import {
  getDesign,
  createDesign,
  updateDesign,
} from "@/services/api/design.service";
import { DesignPayload, Design } from "@/types/design.types";
=======
>>>>>>> a7d6645 (fix: conflict)

// export function useDesign(id?: string) {
//   const [data, setData] = useState<Design | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!id) return;

//     setLoading(true);
//     getDesign(id)
//       .then(setData)
//       .finally(() => setLoading(false));
//   }, [id]);

//   return { data, loading };
// }

// export function useSaveDesign(mode: "add" | "edit", id?: string) {
//   const [loading, setLoading] = useState(false);

//   const save = async (payload: DesignPayload) => {
//     setLoading(true);
//     try {
//       mode === "add"
//         ? await createDesign(payload)
//         : await updateDesign(id!, payload);
//     } finally {
//       setLoading(false);
//     }
//   };

<<<<<<< HEAD
  return { save, loading };
}
>>>>>>> 54d24e8 (fix: merge conflict)
=======
//   return { save, loading };
// }
>>>>>>> a7d6645 (fix: conflict)
