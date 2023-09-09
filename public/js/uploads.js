let droppedImages = [];
let exifList = [];

/**
 * 画像ファイルからExif情報を取得する
 * @param {*} file
 */
function getExif(file) {
  let exifData = "";

  EXIF.getData(file, function () {

    // let datetime = EXIF.getTag(this, "DateTimeOriginal"); //dateTimeではだめ。dateTimeOriginal
    // let ss = EXIF.getTag(this, "ExposureTime"); //シャッタースピード
    // let fnumber = EXIF.getTag(this, "FNumber"); //絞り
    // let iso = EXIF.getTag(this, "ISOSpeedRatings"); //ISO
    // let model = EXIF.getTag(this, "Model"); //カメラモデル
    // console.log("<p>DateTime: " + datetime + "</p>");
    // console.log("<p>SS: 1/" + ss + "</p>");
    // console.log("<p>F: " + fnumber + "</p>");
    // console.log("<p>ISO: " + iso + "</p>");
    // console.log("<p>MODEL: " + model + "</p>");
    // console.log(EXIF.getAllTags(this));

    exifData = EXIF.getAllTags(this);
    console.log('exifData', exifData);
    exifList.push(JSON.stringify(exifData));
  });
}

function sendFiles() {
  if (droppedImages.length === 0 || confirm("アップロードしますか？") === false) return;

  const formData = new FormData();

  $.each(droppedImages, function (index, file) {
    formData.append("field_files", file);
    formData.append("field_files_exif[]", exifList[index]);
  });

  fetch("/uploads", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw "ファイルのアップロードに失敗しました";
      }
      console.log(response);
      console.info("アップロードしました");
    })
    .catch((error) => {
      alert(error);
    });
}

$(function () {
  Dropzone.autoDiscover = false;
  let zekkeiKyushuDropzone = new Dropzone(".dropzone", { 
  url: "/uploads",
  // parallelUploads: 1,
  acceptedFiles: '.jpeg, .jpg, .png',
  maxFiles: 4,
  maxFilesize: 10,
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictRemoveFile: "削除",
  // dictDefaultMessage: `オプション設定`,
});
  zekkeiKyushuDropzone.on("addedfile", function (file) {
    console.log(file);
    getExif(file);
    droppedImages.push(file);
  });
  zekkeiKyushuDropzone.on("removedfile", function (file) {
    let index = droppedImages.indexOf(file);
    if (index >= 0) {
      droppedImages.splice(index, 1);
      exifList.splice(index, 1);
    }
  });
});
