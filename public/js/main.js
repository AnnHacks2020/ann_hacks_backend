window.addEventListener('load', () => {
  const canvas = document.querySelector('#draw-area');
  const context = canvas.getContext('2d');

  // 現在のマウスの位置を中心に、現在選択している線の太さを「○」で表現するために使用するcanvas
  const canvasForWidthIndicator = document.querySelector('#line-width-indicator');
  const contextForWidthIndicator = canvasForWidthIndicator.getContext('2d');

  const lastPosition = { x: null, y: null };
  let isDrag = false;
  let currentColor = '#000000';
  let currentLineWidth = 1;

  // スタックしておく最大回数。キャンバスの大きさの都合などに合わせて調整したら良いです。
  const STACK_MAX_SIZE = 5;
  // スタックデータ保存用の配列
  let undoTagStack = [];
  let redoTagStack = [];
  let beforeTag = 0;
  let afterTag = 0;
  // スタックデータ保存用の配列
  let pointStack = [];
  let pointArray = [];
  var imageTag = 0;
  let inkVolume = 5000;
  let fixImageData = context.createImageData(canvas.width, canvas.height);

  function fixImage(tag_a, tag_b) {
    points_array = pointStack.slice(tag_b, tag_a);
    socket.emit('server send fix', { points: points_array });
  }

  function save() {
    undoTagStack.unshift(imageTag);
    pointStack = pointStack.slice(0, imageTag);
    while (undoTagStack.length) {
      afterTag = undoTagStack.pop();
      fixImage(afterTag, beforeTag);
      beforeTag = afterTag;
    }
  }

  // canvasへの描画処理を行う前に行う処理
  function beforeDraw() {
    // やり直し用スタックの中身を削除
    redoTagStack = [];
    // 元に戻す用の配列が最大保持数より大きくなっているかどうか
    if (undoTagStack.length >= STACK_MAX_SIZE) {
      // 条件に該当する場合末尾の要素を削除
      afterTag = undoTagStack.pop();
      fixImage(afterTag, beforeTag);
      beforeTag = afterTag;
    }
    // 元に戻す配列の先頭にcontextのImageDataを保持する
    undoTagStack.unshift(imageTag);
    pointStack = pointStack.slice(0, imageTag);
  }

  function undo() {
    // 戻す配列にスタックしているデータがなければ処理を終了する
    if (undoTagStack.length <= 0) return;
    // やり直し用の配列に元に戻す操作をする前のCanvasの状態をスタックしておく
    redoTagStack.unshift(imageTag);
    // 元に戻す配列の先頭からイメージデータを取得して
    imageTag = undoTagStack.shift();
    // 描画する
    document.getElementById("area1").innerText = "インク残量：" + Math.round(inkVolume - imageTag);
    imageLoad();
  }

  function redo() {
    // やり直し用配列にスタックしているデータがなければ処理を終了する
    if (redoTagStack.length <= 0) return;
    // 元に戻す用の配列にやり直し操作をする前のCanvasの状態をスタックしておく
    undoTagStack.unshift(imageTag);
    // やり直す配列の先頭からイメージデータを取得して
    imageTag = redoTagStack.shift();
    // 描画する
    document.getElementById("area1").innerText = "インク残量：" + Math.round(inkVolume - imageTag);
    imageLoad();
  }

  function inkVolumeUpdate() {
    if (!isDrag) {
      return;
    }
    imageTag = pointStack.length;
    document.getElementById("area1").innerText = "インク残量：" + Math.round(inkVolume - imageTag);
  }

  function imageLoad() {
    context.putImageData(fixImageData, 0, 0);

    let x = null;
    let y = null;
    for (let i = afterTag; i < imageTag; i++) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = pointStack[i][3];
      context.lineWidth = pointStack[i][2];
      context.beginPath();
      if (x === null || y === null) {
        context.moveTo(pointStack[i][0], pointStack[i][1]);
      } else {
        context.moveTo(x, y);
      }
      context.lineTo(pointStack[i][0], pointStack[i][1]);
      context.stroke();
      context.closePath();

      x = pointStack[i][0];
      y = pointStack[i][1];

      if (undoTagStack.includes(i + 1)) {
        x = null;
        y = null;
      }
    }
  }

  function draw(x, y) {
    if (!isDrag) {
      return;
    }

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = currentLineWidth;
    context.strokeStyle = currentColor;
    if (lastPosition.x === null || lastPosition.y === null) {
      context.moveTo(x, y);
    } else {
      context.moveTo(lastPosition.x, lastPosition.y);
    }
    context.lineTo(x, y);
    context.stroke();

    lastPosition.x = x;
    lastPosition.y = y;

    pointArray = [];
    pointArray.push(x, y, context.lineWidth, context.strokeStyle);
    pointStack.push(pointArray);
  }

  function showLineWidthIndicator(x, y) {
    contextForWidthIndicator.lineCap = 'round';
    contextForWidthIndicator.lineJoin = 'round';
    contextForWidthIndicator.strokeStyle = currentColor;

    contextForWidthIndicator.lineWidth = 1;

    contextForWidthIndicator.clearRect(0, 0, canvasForWidthIndicator.width, canvasForWidthIndicator.height);

    contextForWidthIndicator.beginPath();

    contextForWidthIndicator.arc(x, y, currentLineWidth / 2, 0, 2 * Math.PI);

    contextForWidthIndicator.stroke();
  }


  function dragStart(event) {
    context.beginPath();
    lastPosition.x = event.layerX;
    lastPosition.y = event.layerY;
    isDrag = true;
    beforeDraw();
  }

  function dragEnd(event) {
    context.closePath();
    isDrag = false;
    lastPosition.x = null;
    lastPosition.y = null;
  }

  function initEventHandler() {
    const undoButton = document.querySelector('#undo-button');
    const redoButton = document.querySelector('#redo-button');
    const saveButton = document.querySelector('#save-button');
    undoButton.addEventListener('click', undo);
    redoButton.addEventListener('click', redo);
    saveButton.addEventListener('click', save);

    const layeredCanvasArea = document.querySelector('#layerd-canvas-area');

    layeredCanvasArea.addEventListener('mousedown', dragStart);
    layeredCanvasArea.addEventListener('mouseup', dragEnd);
    layeredCanvasArea.addEventListener('mouseout', dragEnd);
    layeredCanvasArea.addEventListener('mousemove', event => {

      draw(event.layerX, event.layerY);
      inkVolumeUpdate();
      showLineWidthIndicator(event.layerX, event.layerY);
    });
  }

  function initColorPalette() {
    const joe = colorjoe.rgb('color-palette', currentColor);
    joe.on('done', color => {
      currentColor = color.hex();
    });
  }

  function initConfigOfLineWidth() {
    const textForCurrentSize = document.querySelector('#line-width');
    const rangeSelector = document.querySelector('#range-selector');

    currentLineWidth = rangeSelector.value;

    rangeSelector.addEventListener('input', event => {
      const width = event.target.value;

      currentLineWidth = width;

      textForCurrentSize.innerText = width;
    });
  }

  initEventHandler();
  initColorPalette();
  initConfigOfLineWidth();

  let userId = 000;
  let roomId = 000;
  //let restInk = 000;

  // クライアントからサーバーへの接続要求
  const socket = io.connect();
  // 接続時の処理
  socket.on("connect", () => {
    console.dir({ userId: userId, roomId: roomId });
    socket.emit('server send init', { userId: userId, roomId: roomId });
  });

  socket.on('send user init', function (msg) {
    fixImageLoad(msg.drawlist)
    // inkVolumne = msg.restInk; 
  });


  socket.on('send user fix', function (drawlist) {
    fixImageLoad(drawlist);
  });

  socket.on('send user fix to base64', function (drawlist) {
    fixImageLoad(drawlist);
    socket.emit('server send base64', { base64: canvas.toDataURL(), roomId: roomId, userId: userId, restInk: inkVolume - imageTag, json_drawlist: JSON.stringify(drawlist) });

  });

  socket.on('send user fix', function (drawlist) {
    fixImageLoad(drawlist);
  });

  function fixImageLoad(drawlist) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    let fixPoints = drawlist.points;
    let fixTags = drawlist.tags;

    let x_s = null;
    let y_s = null;
    for (let i = 0; i < fixPoints.length; i++) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = fixPoints[i][3];
      context.lineWidth = fixPoints[i][2];
      context.beginPath();
      if (x_s === null || y_s === null) {
        context.moveTo(fixPoints[i][0], fixPoints[i][1]);
      } else {
        context.moveTo(x_s, y_s);
      }
      context.lineTo(fixPoints[i][0], fixPoints[i][1]);
      context.stroke();
      context.closePath();

      x_s = fixPoints[i][0];
      y_s = fixPoints[i][1];

      if (fixTags.includes(i + 1)) {
        x_s = null;
        y_s = null;
      }
    }

    fixImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    imageLoad();
  }

});
