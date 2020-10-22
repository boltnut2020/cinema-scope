import React, {Component} from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Transformer, Text } from 'react-konva';
import InputSlider from './InputSlider';

const windowWidth = window.screen.width;
const stageWidth = 1280
const stageHeight = 720
const thumbnailWidth = 90
const defaultFontSize = 30
const defaultTextColor = "#fff"
const limitPixelSize = 2048
const errorLimitPixelSize = "画像の寸法が" + limitPixelSize + "px を超えています。LightRoomの書き出しサイズ(小)などで調整してみてください。"
const defaultScale="scale(0.5)"

const errorFileType = "ファイルタイプ"

const testImages = []

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
        stageDivHeight: stageHeight,
        transform: defaultScale,
        images: [],
        maskRectangles: maskRectangles,
        currentImage:{src:"", textLine: [], textColor: defaultTextColor, fontSize: defaultFontSize, width: 0, height: 0},
        currentImageIndex: 0,
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
    this.imageRef = React.createRef();
  }

  componentDidMount() {
    console.log("Did Mount")
    this.setStageSize()
    this.setImages()

    console.log(this.stageRef)  
  }

  componentDidUpdate() {
    console.log("Did Update")
  }

  setStageSize(finalCurrentImage) {
    console.log("setStageSize")
    var scaleX = 1
    if ( window.screen.width > 768 && window.innerWidth > 768) {
      scaleX = 768 / this.state.stageWidth * 0.8
    } else {
      scaleX = window.screen.width / this.state.stageWidth * 0.93
    }


//    let heightTragetValue = 1
//    if (finalCurrentImage) {
//        console.log(finalCurrentImage.height)
//        heightTragetValue = finalCurrentImage.height * scaleX
//    } else {
//    }
    var heightTragetValue = this.state.stageHeight * scaleX
    let scaleY =  heightTragetValue / this.state.stageHeight
    this.setState({transform: 'scale(' + scaleX + ',' + scaleY + ')'})
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

  setCurrentImage(index) {

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
    var size = imageObj.onload = () => {
      return {width: imageObj.naturalWidth, height: imageObj.naturalHeight}
    }
    selectedImage.image = imageObj
    selectedImage.naturalWidth = size().width
    selectedImage.naturalHeight = size().height

    if (!selectedImage.scaleXBase) {
      selectedImage.scaleXBase = stageWidth / size().width
      selectedImage.scaleYBase = selectedImage.scaleXBase
      selectedImage.widthBase = selectedImage.naturalWidth * selectedImage.scaleXBase
      selectedImage.heightBase = selectedImage.naturalHeight * selectedImage.scaleYBase
    }
    selectedImage.scaleX = stageWidth / size().width
    selectedImage.scaleY = selectedImage.scaleX
    selectedImage.width = (selectedImage.naturalWidth * selectedImage.scaleXBase).toFixed()
    selectedImage.height = (selectedImage.naturalHeight * selectedImage.scaleYBase).toFixed()

    this.setState({currentImageIndex: index})
    var finalCurrentImage = this.setDefaultImageValue(selectedImage)
    this.setState({currentImage: finalCurrentImage})
    this.setStageSize(finalCurrentImage)
    this.setCinemaScope()
  }

  handleSliderChange = (e, newValue) => {
    console.log("called")
    console.log(e)

    var sizeScale = newValue * 2 / 100
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

    console.log(this.state.images)
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
        <div className="row p-0 overflow-x:scroll">
          {this.state.images.map((thumbnail, i) => {
            return(
              <div key={"thumbnail-" + i} className="col-3 col-lg-1 p-1">
                <img src={thumbnail.src} width={thumbnailWidth} onClick={() => this.setCurrentImage(i)} />
              </div>
            )
          })}
        </div>
        <div key="current-div" className="row">
          <div className="col-sm-6 p-0" >
            <div className="col-sm-12 text-right">
              <div className="row">
                <div className="col-sm-6 text-right">
                </div>
                <div className="col-sm-6 text-right">
                    <p>Canvas: {stageWidth} x {stageHeight} Image: {this.state.currentImage.width} x {this.state.currentImage.height}</p>
                    <InputSlider
                    onChange={this.handleSliderChange} />

                </div>
              </div>
            </div>
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
                    key={"currentRect"}
                    x={ (stageWidth - this.state.currentImage.width) / 2}
                    y={ (stageHeight - this.state.currentImage.height) / 2}
                    width={this.state.currentImage.width}
                    height={this.state.currentImage.height}
                    fillPatternImage={this.state.currentImage.image}
                    fillPatternScaleX={this.state.currentImage.scaleX}
                    fillPatternScaleY={this.state.currentImage.scaleY}
                    filPatternRepeat = "no-repeat"
                    draggable={true}
                  />
                  {this.state.maskRectangles.map((rect, i) => {
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
              <input className="btn btn-light" type="button" value="DownLoad" onClick={this.handleExportClick} />
            </div>
          </div>
          <div className="col-sm-6 p-3">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">File</span>
              </div>
              <div className="custom-file">
                  <input id="inputFile" ref={this.imageRef} onChange={this.setFiles} type="file" className="custom-file-input" multiple />
                  <label htmlFor="imagefile" className="custom-file-label"  data-browse="参照">ファイルを選択(長辺{limitPixelSize}px 2～3MBを上限)</label>
              </div>
            </div>

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
            <input type="text" className="form-control" name="textColor" value={this.state.currentImage.textColor} onChange={this.setText} placeholder="テキストカラー" />
            </div>

            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">Size</span>
              </div>
            <input type="text" className="form-control" name="fontSize" value={this.state.currentImage.fontSize} onChange={this.setText} placeholder="テキストサイズ" />
            </div>
            <div className="input-group mb-3">
              <button>btn</button>
            </div>
          </div>
        </div>
      </div>
      </React.Fragment>
      )
  }
}
export default StageTest
