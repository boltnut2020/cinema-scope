import React, {Component, useRef} from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Transformer, Text } from 'react-konva';
import InputSlider from './InputSlider';

const windowWidth = window.screen.width;

let stageWidth = 1280
let stageHeight = 960
if ( window.screen.width > 768 && window.innerWidth > 768) {
  stageWidth = 2048
  stageHeight = 1536
}
const thumbnailWidth = 96
const defaultFontSize = 30
const defaultTextColor = "#ffffff"
const defaultMaskColor = "#000000"
const defaultTextAlign = "center"
const defaultMaskOpacity = 100
const limitPixelSize = 2048
const errorLimitPixelSize = "画像の寸法が" + limitPixelSize + "px を超えています。LightRoomの書き出しサイズ(小)などで調整してみてください。"
const defaultScale="scale(0.5)"

const errorFileType = "ファイルタイプ"

const testImages = [
 {
    "src": "https://pbs.twimg.com/media/EcUq3mPU4AEPT6t?format=jpg&name=large",
    "id": "rect2",
    "width": "2048",
    "height": "1536",
    "widthOrigin": 4608,
    "heightOrigin": 3456
  },
 {
    "src": "https://pbs.twimg.com/media/EcUq4V8UcAEpId0?format=jpg&name=large",
    "id": "rect2",
    "width": "2048",
    "height": "1536",
    "widthOrigin": 4608,
    "heightOrigin": 3456
  },
 {
    "src": "https://pbs.twimg.com/media/EcUq5TDUwAcBhuq?format=jpg&name=large",
    "id": "rect2",
    "width": "2048",
    "height": "1536",
    "widthOrigin": 4608,
    "heightOrigin": 3456
  },
]

const bgRectangle = {
  x: 0,
  y: 0,
  width: stageWidth,
  height: stageHeight,
  fill: '#202020',
  id: 'background',
}

const appDescription = `
Hello World!\n
このページはシネマスクリーンレイアウトの
簡易的な画像加工アプリです。

『出来る事』


「+」ボタンで画像ファイルを選択しステージに設置

(複数可能)

タップでステージ内の画像移動、ズームバーで拡大、縮小

下帯に表示させるテキストを設定
（移動できます）


※動作確認
今のところAndroid, PCでのChromeブラウザのみで確認済みです。


`

const bgRectangleText = {
    x: 0,
    y: 340,
    width: stageWidth,
    height: stageHeight * 3,
    fill: '#ffffff',
    fontSize: 60,
    textAlign: "center",
    id: 'backgroundText',
    line: appDescription }

const maskRectangles = [
  {
    x: 0,
    y: 0,
    width: windowWidth,
    height: 100,
    fill: '#000000',
    id: 'topmask',
  },
  {
    x: 0,
    y: 0,
    width: windowWidth,
    height: 100,
    fill: '#000000',
    id: 'bottommask',
  },
];

const addButtonCss = {
    position: "absolute",
    top: 5,
    right: 10,
    background: "#000000"
}

const scaleViewCss = {
    position: "absolute",
    top: 50,
    left: "4%",
    color: "#909090",
}
const downloadCss = {
    position: "absolute",
    top: 0,
    right: "5%",
    color: "#909090",
}
const thumbnailDivHeight = {
  background: "#000000",
}
const thumbnailCss = {
  maxWidth: "80px",
  maxHeight: "60px"
}
class StageTest extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        stageWidth: stageWidth,
        stageHeight: stageHeight,
        stageDivWidth: stageWidth,
        stageDivHeight: stageHeight,
        transform: defaultScale,
        images: [],
        maskRectangles: maskRectangles,
        currentImage:{src:"", textLine: "", textColor: defaultTextColor, maskColor: defaultMaskColor,  fontSize: defaultFontSize, width: 0, height: 0, textAlign: defaultTextAlign, imageSizeSlider: 50, maskOpacity: 80 },
        currentImageIndex: 0,
        cinemaMask: true,
        maskHeight: 0,
        csDivHeight: 0,
    }
    this.setStageSize = this.setStageSize.bind(this);
    this.setImages = this.setImages.bind(this);
    this.setText = this.setText.bind(this);
    this.countTextFirstLine = this.countTextFirstLine.bind(this);
    this.setFiles = this.setFiles.bind(this);
    this.setFile = this.setFile.bind(this);
    this.setCinemaScope = this.setCinemaScope.bind(this);
    this.setCurrentImage = this.setCurrentImage.bind(this);
    this.setCurrentImageSize = this.setCurrentImage.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.setDefaultImageValue = this.setDefaultImageValue.bind(this);
    this.handleExportClick = this.handleExportClick.bind(this);
    this.handleChangeState = this.handleChangeState.bind(this);
    this.handleSliderChangeBootstrap = this.handleSliderChangeBootstrap.bind(this);
    this.imageRef = React.createRef();
    this.textRef = React.createRef();
  }

  handleChangeState(e) {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  componentDidMount() {
    // console.log("Did Mount")
    this.setStageSize()
    this.setCinemaScope()
    if (window.location.hostname == "localhost") {
      this.setImages()
    }

    // console.log(this.stageRef)  
  }

  componentDidUpdate() {
    // console.log("Did Update")
    if( this.state.images.length > 0 && this.state.currentImage.src == "") {
       this.setCurrentImage(0)
    }
    // console.log(this.state.images)
  }

  setStageSize(finalCurrentImage) {
    // console.log("setStageSize")
    var scaleX = 1
    if ( window.screen.width > 768 && window.innerWidth > 768) {
      scaleX = 768 / this.state.stageWidth * 0.90
    } else {
      scaleX = window.screen.width / this.state.stageWidth * 0.96
    }


//    let heightTragetValue = 1
//    if (finalCurrentImage) {
//        // console.log(finalCurrentImage.height)
//        heightTragetValue = finalCurrentImage.height * scaleX
//    } else {
//    }
    var heightTragetValue = this.state.stageHeight * scaleX
    var widthTragetValue = this.state.stageWidth * scaleX
    let scaleY =  heightTragetValue / this.state.stageHeight
    this.setState({transform: 'scale(' + scaleX + ',' + scaleY + ')'})
    this.setState({stageDivWidth: widthTragetValue + "px"})
    this.setState({stageDivHeight: heightTragetValue + 30 + "px"})

    let csDivHeight = Number((this.state.stageWidth / 2.39) * scaleX).toFixed()
    this.setState({csDivHeight: Number(csDivHeight) + 20 + "px"})
  }

  setImages() {
    // console.log("set images")
    var newImages = this.state.images

    testImages.map((testImage) => {
      var image = new window.Image();
      image.src = testImage.src;
      image.onload = (e) => {
        testImage.image = image
        var width = image.width;
        var height = image.height;
        if(width > limitPixelSize) {
          height = Math.round(height * limitPixelSize / width);
          width = limitPixelSize;
        }

        testImage.width = width
        testImage.height = height
        testImage.x = (stageWidth - width.toFixed()) / 2,
        testImage.y = (stageHeight - height.toFixed()) / 2,

        newImages.push(testImage)
        this.setState({images: newImages})
      }
    })
  }

  setText() {
    // console.log("set text")
    // console.log(event.target.name)
    var currentImage = this.state.currentImage
    if (event.target.name == "textLine") {
      if (this.state.textLine !== event.target.name) {
        // currentImage.textLine =  event.target.value.split("\n")
        currentImage.textLine =  event.target.value
      }
    }
    if (event.target.name == "textColor") {
      if (this.state.textColor !== event.target.name) {
        currentImage.textColor =  event.target.value
      }
    }

    if (event.target.name == "fontSize") {
      if (this.state.fontSize !== event.target.name) {
        currentImage.fontSize =  event.target.value
      }
    }
    if (event.target.name == "textAlign") {
      // console.log( event.target.value)
      var textPositionX = 0;
      switch(event.target.value) {
        case "left":
            textPositionX = "10"
        break;
        case "right":
            textPositionX = this.state.stageWidth - this.countTextFirstLine() * this.state.currentImage.fontSize - 10
        break;
        case "center":
            textPositionX = (this.state.stageWidth / 2) - (this.countTextFirstLine() * this.state.currentImage.fontSize / 2)
        break;
      }
      currentImage.textPositionX =  textPositionX
    }

    if (event.target.name == "maskColor") {
      // console.log( event.target.value)
      currentImage.maskColor =  event.target.value
      if(currentImage.textColor ==  event.target.value) {
        switch(event.target.value) {
          case "#ffffff":
            currentImage.textColor = "#000000";
            break;
          case "#000000":
            currentImage.textColor = "#ffffff";
            break;
          default:
        }
      }
    }

    if (event.target.name == "maskOpacity") {
        console.log(event.target.value)
        currentImage.maskOpacity = event.target.value
    }

    this.setState({currentImage: this.setDefaultImageValue(currentImage)});
  }

  countTextFirstLine() {
    if (this.state.currentImage.textLine.length == 0) {
      return 0;
    }
    var mapText = this.state.currentImage.textLine.split("\n")
    return mapText[0].length
  }

  async setCurrentImage(index) {

    if(index == undefined) {
        return false
    }
    // console.log("set Current Image")
    // save previous item
    if (this.state.currentImageIndex) {
      var images = this.state.images
      var updateImage = this.state.images[this.state.currentImageIndex]
      for(let key in this.state.currentImage) {
          updateImage[key] = this.state.currentImage[key]
      }
      images[this.state.currentImageIndex] = updateImage
      this.setState({images: images})
    }

    
    var selectedImage = this.state.images[index]

    var imageObj = new window.Image();
    imageObj.src = selectedImage.src;
    var naturalWidth = 0;
    imageObj.onload = () => {
      selectedImage.image = imageObj

      // need initial size for zooming calcurate
      if (!selectedImage.scaleXBase) {
        selectedImage.scaleXBase = stageWidth / selectedImage.width
        selectedImage.scaleYBase = selectedImage.scaleXBase
        selectedImage.widthBase = selectedImage.width * selectedImage.scaleXBase
        selectedImage.heightBase = selectedImage.height * selectedImage.scaleYBase
      }

      selectedImage.scaleX = selectedImage.scaleXBase
      selectedImage.scaleY = selectedImage.scaleYBase
      selectedImage.width = selectedImage.widthBase
      selectedImage.height = selectedImage.heightBase
      selectedImage.x = selectedImage.x
      selectedImage.y = selectedImage.y

      this.setState({currentImageIndex: index})
      var finalCurrentImage = this.setDefaultImageValue(selectedImage)
      // console.log(finalCurrentImage)
      this.setState({currentImage: finalCurrentImage})
      this.setStageSize(finalCurrentImage)
      this.setCinemaScope()
      this.handleSliderChangeBootstrap()
    }
  }

  handleSliderChangeBootstrap(){
    // console.log("handleSliderChangeBootstrap")
    var newValue = event.target.value || this.state.currentImage.imageSizeSlider

    var sizeScale = newValue * 2 / 100
    var currentImage = this.state.currentImage
    currentImage.imageSizeSlider = newValue
    currentImage.scaleX = this.state.currentImage.scaleXBase * sizeScale
    currentImage.scaleY = this.state.currentImage.scaleYBase * sizeScale
    currentImage.width = this.state.currentImage.widthBase * sizeScale
    currentImage.height = this.state.currentImage.heightBase * sizeScale
    // console.log(currentImage)
    this.setState({currentImage: currentImage})
  }

  handleSliderChange = (e, newValue) => {
    // console.log("called")
    // console.log(e)

    var sizeScale = newValue * 3 / 100
    var currentImage = this.state.currentImage
    currentImage.scaleX = this.state.currentImage.scaleXBase * sizeScale
    currentImage.scaleY = this.state.currentImage.scaleYBase * sizeScale
    currentImage.width = this.state.currentImage.widthBase * sizeScale
    currentImage.height = this.state.currentImage.heightBase * sizeScale
    // console.log(currentImage)
    this.setState({currentImage: currentImage})
  }

  setDefaultImageValue(currentImage) {
    if (!currentImage.textColor) {
        currentImage.textColor = defaultTextColor
    }
    if (!currentImage.fontSize) {
        currentImage.fontSize = defaultFontSize
    }
    if (!currentImage.textLine) {
        currentImage.textLine = []
    }
    if (!currentImage.imageSizeSlider) {
        currentImage.imageSizeSlider = 50
    }
    if (!currentImage.textAlign) {
        currentImage.textAlign = "center"
    }
    if (!currentImage.maskColor) {
        currentImage.maskColor = "#000000"
    }

    if (!currentImage.maskOpacity) {
        currentImage.maskOpacity = defaultMaskOpacity
    }
    return currentImage
  }

  async setFiles(e) {
    // console.log("set files")
    // event.preventDefault()
    for(var i in e.target.files) {
      if (event.target.files[i].type == undefined) {
        continue;
      }
      await this.setFile(event.target.files[i])
    }

    // if( this.state.images.length > 0 && this.state.currentImage.src == "") {
    //   // console.log(this.state.images)
    //   this.setCurrentImage(0)
    // }
  }

  setFile(file) {

    // console.log("set file")
    var reader = new FileReader();
    var imageObj = new window.Image();
    var url = window.URL.createObjectURL(file)

    reader.onloadend = () => {
      imageObj.src = url;
      imageObj.onload = (e) => {

        var width = imageObj.width;
        var height = imageObj.height;

         if(width > limitPixelSize) {

             height = Math.round(height * limitPixelSize / width);
             width = limitPixelSize;
         }

         var canvas = document.createElement('canvas');
         canvas.width = width;
         canvas.height = height;
         var ctx = canvas.getContext('2d');
         ctx.drawImage(imageObj, 0, 0, width, height);
         var newFile = ctx.canvas.toBlob((blob) => {
           const imageFile = new File([blob], file.name, {
               type: file.type,
               lastModified: Date.now()
           });

           url = window.URL.createObjectURL(imageFile)
           var newItem = {
             src: url,
             id: 'rect' + (this.state.images.length + 1),
             width: width.toFixed(),
             height: height.toFixed(),
             widthOrigin: imageObj.width,
             heightOrigin: imageObj.height,
             x: 0,
             y: 0
           }
           
           var newImages = this.state.images
           console.log("newImages")
           console.log(this.state)
           console.log(newItem)
           newImages.push(newItem)
           this.setState({images: newImages})

         }, file.type, 1);
      }
    }
    reader.readAsDataURL(file);

  }

  setCinemaScope() {
    // console.log("set cinema scope")
    let maskHeight = 0
    maskHeight =  ((this.state.stageHeight- (this.state.stageWidth / 2.39)) / 2).toFixed()
    this.setState({maskHeight: Number(maskHeight)})
    let newMaskRectangles = []
    maskRectangles.map((rect, i) => {

      if(rect.id == "topmask") {
          rect.width = this.state.stageWidth
          rect.height = maskHeight
      }

      if(rect.id == "bottommask") {
          rect.width = this.state.stageWidth
          rect.y = this.state.stageHeight - maskHeight
          rect.height = maskHeight
      }
      newMaskRectangles.push(rect)
    })
    this.setState({maskRectangles: newMaskRectangles})
  }

  handleDragEnd(e) {
    var x = e.target.x()
    var y = e.target.y()

    var currentImage = this.state.currentImage
    currentImage.x = x
    currentImage.y = y

    this.setState({currentImage: currentImage})
    // x: e.target.x(),
  }

  handleExportClick() {
    var uri = this.stageRef.getStage().toDataURL({mimeType: "image/jpeg", quality: 1});
    var link = document.createElement('a');
    link.download = "cinema-scope.jpg";
    link.href = uri;
     document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // delete link;
  }

  render() {

    return(
      <React.Fragment>
      <div className="container-fluid">
        <div className="row p-0 overflow-auto mb-3" style={thumbnailDivHeight}>
          <div className="col-12">
            <div className="row col-12 overflow-hidden">
            {this.state.images.map((thumbnail, i) => {
              return(
                <div key={"thumbnail-" + i} className="col-4 col-lg-1">
                  <img src={thumbnail.src} style={thumbnailCss} onClick={() => this.setCurrentImage(i)} />
                </div>
              )
            })}
            </div>
          </div>

            <label>
              <span className="btn btn-primary" style={addButtonCss}>
              +
                <input id="inputFile" ref={this.imageRef} onChange={this.setFiles} type="file"  multiple style={{display: "none"}}/>
              </span>
            </label>
        </div>
        <div key="current-div" className="row">
          <div className="col-sm-6 p-0" >
            <ul className="nav nav-tabs border-0" role="tablist pd-0">
              <li className="nav-item">
                <a className="nav-link active" id="item1-tab" data-toggle="tab" href="#item1" role="tab" aria-controls="item1" aria-selected="true">帯付き</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" id="item2-tab" data-toggle="tab" href="#item2" role="tab" aria-controls="item2" aria-selected="false">帯無し</a>
              </li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane fade show active" id="item1" role="tabpanel" aria-labelledby="item1-tab">
                <div 
                  className="col-sm-12 p-2"
                  style={{height: `${this.state.stageDivHeight}`}}
                >
                  <Stage
                    ref={node => { this.stageRef = node}}
                    width={this.state.stageWidth} 
                    height={this.state.stageHeight}
                    style={{transformOrigin: "top left", transform: `${ this.state.transform }`, textAlign: "center" }}
                  >
                    <Layer>
                      <Rect
                        key={bgRectangle.id}
                        x={bgRectangle.x}
                        y={bgRectangle.y}
                        fill={this.state.currentImage.maskColor || bgRectangle.fill}
                        width={bgRectangle.width}
                        height={bgRectangle.height}
                      />
                      { this.state.currentImage.src == "" &&
                      <Text
                        key={bgRectangleText.id}
                        fontSize={this.state.currentImage.fontSize || bgRectangleText.fontSize}
                        text={bgRectangleText.line}
                        wrap="char"
                        align={this.state.currentImage.textAlign || bgRectangleText.textAlign}
                        width={bgRectangleText.width}
                        height={bgRectangleText.height}
                        y={bgRectangleText.y}
                        fill={this.state.currentImage.textColor || bgRectangleText.fill}
                        draggable={true}
                      />
                      }

                      <Rect
                        key={"currentRect"}
                        x={this.state.currentImage.x}
                        y={this.state.currentImage.y}
                        width={Number(this.state.currentImage.width)}
                        height={Number(this.state.currentImage.height)}
                        fillPatternImage={this.state.currentImage.image}
                        fillPatternScaleX={this.state.currentImage.scaleX}
                        fillPatternScaleY={this.state.currentImage.scaleY}
                        filPatternRepeat = "no-repeat"
                        draggable={true}
                        onDragEnd={this.handleDragEnd}
                      />
                      {/*
                      <Text 
                        width={300}
                        height={500}
                        wrap="char"
                        x={0}
                        y={500}
                        fill={"red"}
                        text={
                         "width:" + this.state.currentImage.width
                         + "scaleX" + this.state.currentImage.scaleX
                         + "scaleY" + this.state.currentImage.scaleY
                        } 
                        fontSize={100}
                      />
                      */}
                      {this.state.cinemaMask == true && this.state.maskRectangles.map((rect, i) => {
                        return (
                          <Rect
                            key={rect.id}
                            opacity={this.state.currentImage.maskOpacity / 100}
                            x={rect.x}
                            y={rect.y}
                            fill={this.state.currentImage.maskColor || rect.fill}
                            width={rect.width}
                            height={rect.height}
                          />
                        );
                      })}
                      <Text
                        key={"textLine"}
                        ref={this.textRef}
                        fontSize={Number(this.state.currentImage.fontSize)}
                        text={this.state.currentImage.textLine}
                        wrap="char"
                        lineHeight={1.4}
                        align={this.state.currentImage.textAlign}
                        height={stageHeight}
                        x={ this.state.currentImage.textPositionX || (this.state.stageWidth / 2) - (this.countTextFirstLine() * this.state.currentImage.fontSize / 2)}
                        y={ ((this.state.stageHeight - this.state.maskHeight) + 45) + 40}
                        fill={this.state.currentImage.textColor}
                        draggable={true}
                        style={{ transform: `${ this.state.transform }` }}
                      />

                      {/*
                      {this.state.currentImage.textLine.map((line, i) => {
                        var positionY = i * 40
                        return(
                          <Text
                            key={"textline" + i}
                            fontSize={Number(this.state.currentImage.fontSize)}
                            text={line}
                            wrap="char"
                            align={this.state.currentImage.textAlign}
                            width={stageWidth}
                            height={stageHeight}
                            y={( (this.state.stageHeight - this.state.maskHeight) + 45 * i) + 40}
                            fill={this.state.currentImage.textColor}
                            draggable={true}
                            style={{ transform: `${ this.state.transform }` }}
                          />
                        )})}
                      */}
                    </Layer>
                  </Stage>
                </div>

                <div className="p-0 m-0" style={scaleViewCss}>
                  scale: { (this.state.currentImage.imageSizeSlider - 50) * 6 }
                </div>
                <input className="btn btn-dark text-light mb-2" style={downloadCss} type="button" value="DownLoad" onClick={this.handleExportClick} />
                <div className="col-sm-12 text-center">
                  <div className="form-group">
                    <input type="range" id="imageSizeSlider" name="imageSizeSlider" className="" value={this.state.currentImage.imageSizeSlider} onChange={this.handleSliderChangeBootstrap} />
                  </div>
      
                </div>
              </div>
              <div className="tab-pane fade" id="item2" role="tabpanel" aria-labelledby="item2-tab">
                <CropCurrentImage state={this.state} images={this.state.images} />
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="input-group mb-2">
              <div className="input-group-prepend">
                <span className="input-group-text">Text</span>
              </div>
              {/*
              <textarea className="form-control" name="textLine" value={this.state.currentImage.textLine.join("\n")} onChange={this.setText} placeholder="下帯に表示させるテキストを入力" />
              */}
              <textarea className="form-control" name="textLine" value={this.state.currentImage.textLine} onChange={this.setText} placeholder="下帯に表示させるテキストを入力" />
            </div>
            <div className="btn-group" role="group" aria-label="Basic example">
              <label>
                <span className="btn btn-light">
                  <i className="fas fa-align-left"></i>
                  <input type="button" name="textAlign" value="left" onClick={this.setText} style={{display: "none"}}/>
                </span>
              </label>
              <label>
                <span className="btn btn-light">
                  <i className="fas fa-align-center"></i>
                  <input type="button" name="textAlign" value="center" onClick={this.setText} style={{display: "none"}}/>
                </span>
              </label>
              <label>
                <span className="btn btn-light">
                  <i className="fas fa-align-right"></i>
                  <input type="button" name="textAlign" value="right" onClick={this.setText} style={{display: "none"}}/>
                </span>
              </label>
              <div className="input-group col-2">
                <input type="color"  className="" name="textColor" value={this.state.currentImage.textColor} onChange={this.setText} placeholder="テキストカラー" />

              </div>
              <div className="form-group text-right">
                <input type="range" id="fontSize" name="fontSize" className="form-control-range" value={this.state.currentImage.fontSize} onChange={this.setText} />Size:{this.state.currentImage.fontSize}
              </div>
            </div>

            <div className="" role="group" aria-label="Basic example">
              <div className="input-group pb-4">
                <input type="color"  className="" name="maskColor" value={this.state.currentImage.maskColor} onChange={this.setText} placeholder="帯色" />
                <span className="ml-2">帯色</span>
              </div>
              <div className="form-group pb-4">
                <input type="range"  className="" name="maskOpacity" value={this.state.currentImage.maskOpacity} onChange={this.setText} />
                <span className="ml-2">不透明度:{this.state.currentImage.maskOpacity}</span>
              </div>

              <div className="custom-control custom-switch ml-3">
                <input id="cinemaMask" name="cinemaMask" className="custom-control-input" type="checkbox" value={this.state.cinemaMask} onChange={this.handleChangeState} checked={this.state.cinemaMask} />
                <label className="custom-control-label" htmlFor="cinemaMask">帯</label>
              </div>
           
            </div>
            {/*
            <div className="input-group mb-3">
              <ul className="list-group text-dark">
                <li className="list-group-item p-2">Property</li>
                <li className="list-group-item"><i className="far fa-window-maximize mr-2"></i>{this.state.stageWidth} x {this.state.stageHeight}
                <i className="far fa-image ml-2 mr-2"></i>{this.state.currentImage.width} x {this.state.currentImage.height}</li>
              </ul>
            </div>
            <div className="input-group mb-3">
              <textarea className="form-control" value={JSON.stringify(this.state.images, null, 2)} />
            </div>
            */}
          </div>
        </div>
      </div>
      </React.Fragment>
      )
  }
}

const CropCurrentImage = props => {

  const{state} = props
  const scale = state.transform
  const csWidth = state.stageWidth
  const csHeight = Number((state.stageWidth / 2.39)).toFixed()
  const csstHeightScale = csHeight / state.stageHeight
  const maskHeightT = Number(state.maskHeight * csstHeightScale)
  let stageRef = useRef(null);
  // console.log("CropCurrentImage")
  // console.log(csWidth/csHeight)
  var imageThird = state.images[2]
  var imageSecond = state.images[1]
  var imageFirst = state.images[0]
  // console.log("maskHeight" + state.maskHeight)

  const handleExportClick = () => {
    var uri = stageRef.getStage().toDataURL({mimeType: "image/jpeg", quality: 1});
    var link = document.createElement('a');
    link.download = "cinema-scope.jpg";
    link.href = uri;
     document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // delete link;
  }

  return(
    <>
    <div 
      style={{height: `${state.csDivHeight}`}}
      className="col-sm-12 p-2"
    >
      <Stage
        ref={node => {stageRef = node }}
        width={state.stageWidth} 
        height={ csHeight }
        style={{transformOrigin: "top left", transform: `${ state.transform }`, textAlign: "center" }}
      >
        <Layer>
        { state.currentImage.image != undefined &&
        <>
        <Rect 
            width={state.currentImage.width}
            height={state.currentImage.height}
            x={state.currentImage.x}
            y={state.currentImage.y - state.maskHeight}
            fillPatternImage={state.currentImage.image}
            fillPatternScaleX={state.currentImage.scaleX}
            fillPatternScaleY={state.currentImage.scaleY}
            filPatternRepeat = "no-repeat"
        />
        </>
        }
        </Layer>
      </Stage>
    </div>
    <input className="btn btn-dark text-light mb-2 " style={downloadCss} type="button" value="DownLoad" onClick={handleExportClick} />
    </>
  )
}

export default StageTest
