import {
  AmbientLight,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "GLTFLoader";
import { ScrollTrigger } from "ScrollTrigger";

function menuClick(elmName) {
  window.location.hash = elmName;
  $(".sidenav-overlay").click();
}

let map;
const mapDiv = document.getElementById("map");
const defaultLatLng = { lat: 32.9519, lng: 131.1209 };
// center: { lat: 35.6594945, lng: 139.6999859 },
// center: { lat: 32.9519, lng: 131.1209 }, // 阿蘇
// center: { lat: 33.59110233, lng: 130.4050799 }, //　zeku
const mapOptions = {
  tilt: 0,
  heading: 0,
  zoom: 8,
  center: defaultLatLng,
  mapId: $("#mapId").val(),
  // disable interactions due to animation loop and moveCamera
  disableDefaultUI: true,
  gestureHandling: "none",
  keyboardShortcuts: false,
  // mapTypeId: 'satellite',
  // mapTypeId: "hybrid",
  // mapTypeId: 'terrain',
};

/**
 * Google Mapの初期化
 */
function initMap() {
  map = new google.maps.Map(mapDiv, mapOptions);

  // 通常マーカー挿入＆クリックサンプル
  // const sampleMarker = new google.maps.Marker({
  //   position: defaultLatLng,
  //   map,
  //   title: "Hello World!",
  // });
  // sampleMarker.addListener("click", () => {
  //   map.setZoom(8);
  //   map.setCenter(sampleMarker.getPosition());
  // });

  initWebglOverlayView(map);
}

/**
 * WebGLオーバーレイビューの初期化
 */
function initWebglOverlayView(map) {
  let scene, renderer, camera, loader;
  const webglOverlayView = new google.maps.WebGLOverlayView();

  webglOverlayView.onAdd = () => {
    // Set up the scene.
    scene = new Scene();
    camera = new PerspectiveCamera();

    const ambientLight = new AmbientLight(0xffffff, 0.75); // Soft white light.

    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.25);

    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);
    // Load the model.
    loader = new GLTFLoader();

    const source =
      "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf";

    loader.load(source, (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
      gltf.scene.rotation.x = Math.PI; // Rotations are in radians.
      scene.add(gltf.scene);
    });
  };

  webglOverlayView.onContextRestored = ({ gl }) => {
    // Create the js renderer, using the
    // maps's WebGL rendering context.
    renderer = new WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;
    // Wait to move the camera until the 3D model loads.
    loader.manager.onLoad = () => {
      renderer.setAnimationLoop(() => {
        webglOverlayView.requestRedraw();

        const { tilt, heading, zoom } = mapOptions;

        map.moveCamera({ tilt, heading, zoom });
        // Rotate the map 360 degrees.
        if (mapOptions.tilt < 67.5) {
          mapOptions.tilt += 0.5;
        // } else if (mapOptions.heading <= 360) {
        } else if (mapOptions.heading <= 100) {
          mapOptions.heading += 0.2;
          mapOptions.zoom += 0.025;
        } else {
          // アニメーション終了
          renderer.setAnimationLoop(null);
        }
      });
    };
  };

  webglOverlayView.onDraw = ({ gl, transformer }) => {
    const latLngAltitudeLiteral = {
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 100,
    };
    // Update camera matrix to ensure the model is georeferenced correctly on the map.
    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);

    camera.projectionMatrix = new Matrix4().fromArray(matrix);
    webglOverlayView.requestRedraw();
    renderer.render(scene, camera);
    // Sometimes it is necessary to reset the GL state.
    renderer.resetState();
  };

  webglOverlayView.setMap(map);
}

(function ($) {
  $(function () {
    $(".sidenav").sidenav({
      edge: "right",
    });
  }); // end of document ready

  window.addEventListener(
    "DOMContentLoaded",
    () => {
      initMap();

      // Facebookグループの投稿を取得
      // FB.api(
      //   "/1580012108763267/feed?access_token=EAAI8KpZBqYnwBO2xBRR2E5pDxwiQAZA8U7sofTdjSFtSz0ZCgZBkL5WSHZAKwnqivQS2xhp01RQvOADYZA4tptLbVrTp2IIiZA8laQEknNn7QCSlFfSjsDeOaNYTBZBwl6GAFDFFKqv8OAVIRglwZAcfH49AP0UEL24b9NBt80CpMalZBJF46GZBYIE25YR",
      //   function (res) {
      //     if (res && !res.error) {
      //       /* handle the result */
      //     }
      //     console.log(res)
      //   }
      // );

    },
    false
  );
})(jQuery); // end of jQuery name space
