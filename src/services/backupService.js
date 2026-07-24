import api from "./api";

const exportJson = () =>
  api.get("/backup/export/json", { responseType: "blob" }).then((r) => r.data);

const exportSql = () =>
  api.get("/backup/export/sql", { responseType: "blob" }).then((r) => r.data);

const importJson = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/backup/import/json", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export default {
  exportJson,
  exportSql,
  importJson,
};
