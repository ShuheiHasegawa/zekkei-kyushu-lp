function sendFiles() {
  const input = document.querySelector("#uploadFiles");
  const formData = new FormData();
  formData.append('field_files', input.files[0]);
  formData.append('field_files', input.files[1]);
  fetch('/uploads', {
      method: 'POST',
      body: formData,
  }).then(response => {
      if (!response.ok) {
          throw('ファイルのアップロードに失敗しました');
      }
      alert("アップロードしました")
  }).catch((error) => {
      alert(error);
  });
}
