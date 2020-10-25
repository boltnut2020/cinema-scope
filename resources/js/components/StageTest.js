import React, {Component} from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Transformer, Text } from 'react-konva';
import InputSlider from './InputSlider';

const windowWidth = window.screen.width;

let stageWidth = 1280
let stageHeight = 720
if ( window.screen.width > 768 && window.innerWidth > 768) {
  stageWidth = 2048
  stageHeight = 1152
}
const thumbnailWidth = 90
const defaultFontSize = 30
const defaultTextColor = "#ffffff"
const limitPixelSize = 2048
const errorLimitPixelSize = "画像の寸法が" + limitPixelSize + "px を超えています。LightRoomの書き出しサイズ(小)などで調整してみてください。"
const defaultScale="scale(0.5)"

const errorFileType = "ファイルタイプ"

const testImages = []

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
    y: 140,
    width: stageWidth,
    height: stageHeight * 3,
    fill: '#ffffff',
    fontSize: 40,
    id: 'backgroundText',
    line: appDescription }

const maskRectangles = [
  {
    x: 0,
    y: 0,
    width: windowWidth,
    height: 100,
    fill: 'black',
    id: 'topmask',
  },
  {
    x: 0,
    y: 0,
    width: windowWidth,
    height: 100,
    fill: 'black',
    id: 'bottommask',
  },
];


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
        currentImage:{src:"", textLine: [], textColor: defaultTextColor, fontSize: defaultFontSize, width: 0, height: 0},
        currentImageIndex: 0,
        cinemaMask: true,
    }
    this.setStageSize = this.setStageSize.bind(this);
    this.setImages = this.setImages.bind(this);
    this.setText = this.setText.bind(this);
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
    console.log("Did Mount")
    this.setStageSize()
    this.setCinemaScope()
    // this.setImages()

    console.log(this.stageRef)  
  }

  componentDidUpdate() {
    console.log("Did Update")
    if( this.state.images.length > 0 && this.state.currentImage.src == "") {
       console.log(this.state.images)
       this.setCurrentImage(0)
    }

  }

  setStageSize(finalCurrentImage) {
    console.log("setStageSize")
    var scaleX = 1
    if ( window.screen.width > 768 && window.innerWidth > 768) {
      scaleX = 768 / this.state.stageWidth * 0.9
    } else {
      scaleX = window.screen.width / this.state.stageWidth * 0.9
    }


//    let heightTragetValue = 1
//    if (finalCurrentImage) {
//        console.log(finalCurrentImage.height)
//        heightTragetValue = finalCurrentImage.height * scaleX
//    } else {
//    }
    var heightTragetValue = this.state.stageHeight * scaleX
    var widthTragetValue = this.state.stageWidth * scaleX
    let scaleY =  heightTragetValue / this.state.stageHeight
    this.setState({transform: 'scale(' + scaleX + ',' + scaleY + ')'})
    this.setState({stageDivWidth: widthTragetValue + "px"})
    this.setState({stageDivHeight: heightTragetValue + 30 + "px"})
  }

  setImages() {

    var newImages = this.state.images

    testImages.map((testImage) => {
      var image = new window.Image();
      image.src = testImage.src;
      testImage.image = image
      newImages.push(testImage)
    })
    this.setState({images: newImages})
  }

  setText() {
    var currentImage = this.state.currentImage
    if (event.target.name == "textLine") {
      if (this.state.textLine !== event.target.name) {
        currentImage.textLine =  event.target.value.split("\n")
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

    this.setState({currentImage: this.setDefaultImageValue(currentImage)});
  }

  async setCurrentImage(index) {

    if(index == undefined) {
        return false
    }
    console.log("set Current Image")
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
      selectedImage.scaleY = selectedImage.scaleXBase
      selectedImage.width = selectedImage.widthBase
      selectedImage.height = selectedImage.heightBase


      this.setState({currentImageIndex: index})
      var finalCurrentImage = this.setDefaultImageValue(selectedImage)
      console.log(finalCurrentImage)
      this.setState({currentImage: finalCurrentImage})
      this.setStageSize(finalCurrentImage)
      this.setCinemaScope()
    }
  }

  handleSliderChangeBootstrap(){
    console.log("called")
    var newValue = event.target.value

    var sizeScale = newValue * 3 / 100
    var currentImage = this.state.currentImage
    currentImage.imageSizeSlider = newValue
    currentImage.scaleX = this.state.currentImage.scaleXBase * sizeScale
    currentImage.scaleY = this.state.currentImage.scaleYBase * sizeScale
    currentImage.width = this.state.currentImage.widthBase * sizeScale
    currentImage.height = this.state.currentImage.heightBase * sizeScale
    console.log(currentImage)
    this.setState({currentImage: currentImage})
  }

  handleSliderChange = (e, newValue) => {
    console.log("called")
    console.log(e)

    var sizeScale = newValue * 3 / 100
    var currentImage = this.state.currentImage
    currentImage.scaleX = this.state.currentImage.scaleXBase * sizeScale
    currentImage.scaleY = this.state.currentImage.scaleYBase * sizeScale
    currentImage.width = this.state.currentImage.widthBase * sizeScale
    currentImage.height = this.state.currentImage.heightBase * sizeScale
    console.log(currentImage)
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

    return currentImage
  }

  async setFiles(e) {
    console.log("set files")
    e.preventDefault()
    for(var i in e.target.files) {
      if (event.target.files[i].type == undefined) {
        continue;
      }
      await this.setFile(event.target.files[i])
    }

    // if( this.state.images.length > 0 && this.state.currentImage.src == "") {
    //   console.log(this.state.images)
    //   this.setCurrentImage(0)
    // }
  }

  setFile(file) {

    console.log("set file")
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
             heightOrigin: imageObj.height
           }
           
           var newImages = this.state.images
           console.log(newImages)
           newImages.push(newItem)
           this.setState({images: newImages})

         }, file.type, 1);
      }
    }
    reader.readAsDataURL(file);

  }

  setCinemaScope() {
    console.log("set cinema scope")
    let maskHeight = 0
    maskHeight =  (this.state.stageHeight - this.state.stageWidth  / 2.39) / 2
    this.setState({maskHeight: maskHeight})
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

  handleDragEnd() {
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
        <div className="row p-0 overflow-x:scroll mb-3" style={{minHeight: "75px", borderBottom: "1px #000 solid"}}>
          <div className="col-10">
            <div className="row col-12">
            {this.state.images.map((thumbnail, i) => {
              return(
                <div key={"thumbnail-" + i} className="col-3 col-lg-1 p-1">
                  <img src={thumbnail.src} width={thumbnailWidth} onClick={() => this.setCurrentImage(i)} />
                </div>
              )
            })}
            </div>
          </div>

          <div key={"inputFileDir"} className="col-2 col-lg-1 p-1 mr-2 text-right">
            <label>
              <span className="btn btn-primary">
              +
                <input id="inputFile" ref={this.imageRef} onChange={this.setFiles} type="file"  multiple style={{display: "none"}}/>
              </span>
            </label>
          </div>
        </div>
        <div key="current-div" className="row">
          <div className="col-sm-6 p-0" >
            {/*
            <div className="col-sm-12 text-right">
              <div className="row">
                <div className="col-sm-6 text-right">
                </div>
                <div className="col-sm-6 text-right">
                    <p>Canvas: {stageWidth} x {stageHeight} Image: {this.state.currentImage.width} x {this.state.currentImage.height}</p>

                </div>
              </div>
            </div>
            */}
            <div 
              className="col-sm-12"
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
                    fill={bgRectangle.fill}
                    width={bgRectangle.width}
                    height={bgRectangle.height}
                  />
                  { this.state.currentImage.src == "" &&
                  <Text
                    key={bgRectangleText.id}
                    fontSize={this.state.currentImage.fontSize || bgRectangleText.fontSize}
                    text={bgRectangleText.line}
                    wrap="char"
                    align="center"
                    width={bgRectangleText.width}
                    height={bgRectangleText.height}
                    y={bgRectangleText.y}
                    fill={this.state.currentImage.textColor || bgRectangleText.fill}
                    draggable={true}
                  />
                  }

                  <Rect
                    key={"currentRect"}
                    x={ (stageWidth - this.state.currentImage.width) / 2}
                    y={ (stageHeight - this.state.currentImage.height) / 2}
                    width={Number(this.state.currentImage.width)}
                    height={Number(this.state.currentImage.height)}
                    fillPatternImage={this.state.currentImage.image}
                    fillPatternScaleX={this.state.currentImage.scaleX}
                    fillPatternScaleY={this.state.currentImage.scaleY}
                    filPatternRepeat = "no-repeat"
                    draggable={true}
                  />
                  {this.state.cinemaMask == true && this.state.maskRectangles.map((rect, i) => {
                    return (
                      <Rect
                        key={rect.id}
                        x={rect.x}
                        y={rect.y}
                        fill={rect.fill}
                        width={rect.width}
                        height={rect.height}
                      />
                    );
                  })}

                  {this.state.currentImage.textLine.map((line, i) => {
                    var positionY = i * 40
                    return(
                      <Text
                        key={"textline" + i}
                        fontSize={Number(this.state.currentImage.fontSize)}
                        text={line}
                        wrap="char"
                        align="center"
                        width={stageWidth}
                        height={stageHeight}
                        y={( (this.state.stageHeight - this.state.maskHeight) + 40 * i) + 15}
                        fill={this.state.currentImage.textColor}
                        draggable={true}
                        onDragEnd={this.handleDragEnd}
                        style={{ transform: `${ this.state.transform }` }}
                      />
                    )})}

                </Layer>
              </Stage>
            </div>
            <div className="col-sm-12 text-right">
              <div className="form-group">
                <label htmlFor="imageSizeSlider">scale:{ (this.state.currentImage.imageSizeSlider - 50) * 6 }</label>
                <input type="range" id="imageSizeSlider" name="imageSizeSlider" className="form-control-range" value={this.state.currentImage.imageSizeSlider} onChange={this.handleSliderChangeBootstrap} />
              </div>

              <input className="btn btn-light" type="button" value="DownLoad" onClick={this.handleExportClick} />
            </div>
          </div>
          <div className="col-sm-6 p-3">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">Text</span>
              </div>
              <textarea className="form-control" name="textLine" value={this.state.currentImage.textLine.join("\n")} onChange={this.setText} placeholder="下帯に表示させるテキストを入力" />
            </div>

            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">Color</span>
              </div>
            <input type="color" className="form-control" name="textColor" value={this.state.currentImage.textColor} onChange={this.setText} placeholder="テキストカラー" />
            </div>
            <div className="form-group">
              <label htmlFor="fontSize">FontSize:{this.state.currentImage.fontSize}</label>
              <input type="range" id="fontSize" name="fontSize" className="form-control-range" value={this.state.currentImage.fontSize} onChange={this.setText} />
            </div>

            <div className="custom-control custom-switch mb-3">
              <input id="cinemaMask" name="cinemaMask" className="custom-control-input" type="checkbox" value={this.state.cinemaMask} onChange={this.handleChangeState} checked={this.state.cinemaMask} />
              <label className="custom-control-label" for="cinemaMask">黒帯</label>
            </div>

            <div className="input-group mb-3">
              <ul className="list-group text-dark">
                <li className="list-group-item p-2">Property</li>
                <li className="list-group-item"><i className="far fa-window-maximize mr-2"></i>{this.state.stageWidth} x {this.state.stageHeight}
                <i className="far fa-image ml-2 mr-2"></i>{this.state.currentImage.width} x {this.state.currentImage.height}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </React.Fragment>
      )
  }
}
export default StageTest
