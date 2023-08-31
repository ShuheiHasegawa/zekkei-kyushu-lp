function menuClick(elmName) {
  window.location.hash = elmName;
  $(".sidenav-overlay").click();
}

// initMap
function initMap() {
  const myLatLng = { lat: 32.9519, lng: 131.1209 };
  

  // center: { lat: 35.6594945, lng: 139.6999859 },
  // center: { lat: 32.9519, lng: 131.1209 }, // 阿蘇
  // center: { lat: 33.59110233, lng: 130.4050799 }, //　zeku

  const mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(myLatLng),
    heading: 150,
    tilt: 45,
    mapId: "15431d2b469f209e", //ここは各自のGoogle Cloud Platformのマップ管理にMap IDの半角英数字のもの
    isFractionalZoomEnabled: true,
    // mapTypeId: 'satellite',
    mapTypeId: 'hybrid',
    // mapTypeId: 'terrain',
  }
  const map = new google.maps.Map(document.getElementById("map"), mapOptions);
  new google.maps.Marker({
    position: myLatLng,
    map
  });
  // new map.moveCamera({
  //   center: new google.maps.LatLng(myLatLng),
  //   zoom: 16,
  //   heading: 320,
  //   tilt: 47.5,
  // });
  
  // renderer = new google.maps.WebGLRenderer({
  //   canvas: gl.canvas,
  //   context: gl,
  //   ...gl.getContextAttributes(),
  // });
  // renderer.autoClear = false;


  const degreesPerSecond = 3;

  function animateCamera(time) {
    // Update the heading, leave everything else as-is.
    map.moveCamera({
      heading: (time / 1000) * degreesPerSecond,
    });

    requestAnimationFrame(animateCamera);
  }

  // Start the animation.
  requestAnimationFrame(animateCamera);

  // Using map.set
  map.set("isFractionalZoomEnabled", true);

  // Using map.setOptions
  map.setOptions({ isFractionalZoomEnabled: true });

  const mapDiv = document.getElementById("map");
  map = new google.maps.Map(mapDiv, mapOptions);
  initWebglOverlayView(map);
}


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

    let mapOpacityVal = 1;
    let imgOpacityVal = 0;
    // Wait to move the camera until the 3D model loads.
    loader.manager.onLoad = () => {
      renderer.setAnimationLoop(() => {
        webglOverlayView.requestRedraw();
        const { tilt, heading, zoom } = mapOptions;
        map.moveCamera({ tilt, heading, zoom });

        // Rotate the map 360 degrees.
        if (mapOptions.tilt < 67.5) {
          mapOptions.tilt += 1.5;
        } else if (mapOptions.heading <= 360 && mapOptions.zoom < 30.0) {
          mapOptions.heading += 0.2;
          mapOptions.zoom += 0.05;
          // console.log(mapOptions.zoom);
        } else if (mapOptions.zoom > 24.0 && mapOptions.zoom < 26.0) {
          if (mapOpacityVal > 0.0) mapOpacityVal -= 0.1;
          if (imgOpacityVal < 1.0) imgOpacityVal += 0.1;
          const mapDiv = document.getElementById("map");
          mapDiv.style.filter = `opacity(${mapOpacityVal})`;
          const topImg = document.getElementById("topImg");
          topImg.style.filter = `opacity(${imgOpacityVal})`;
        } else if (mapOptions.zoom > 30.0) {
          const mapDiv = document.getElementById("map");
          mapDiv.hidden = true;
          const topImg = document.getElementById("topImg");
          topImg.style.display = "block";
          topImg.style.filter = `opacity(1)`;
        } else {
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
    $(".sidenav").sidenav();
  }); // end of document ready

  window.addEventListener(
    "DOMContentLoaded",
    () => {
      initMap();
    },
    false
  );
})(jQuery); // end of jQuery name space