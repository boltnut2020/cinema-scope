import React, {Component} from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Transformer, Text } from 'react-konva';

const stageWidth = 1280
const stageHeight = 720
const thumbnailWidth = 100
const defaultFontSize = 50
const defaultTextColor = "#000"
const limitPixelSize = 10008
const errorLimitPixelSize = "画像の寸法が" + limitPixelSize + "px を超えています。LightRoomの書き出しサイズ(小)などで調整してみてください。"
const errorFileType = "ファイルタイプ"

const testImages = [
    {
      id: "201911-twice_gtmnmcl_l_full.jpg",
      src: "https://www.cinra.net/uploads/img/column/201911-twice_gtmnmcl_l_full.jpg",
      textLine: ["text1","text2"],
      fontSize: 50,
    },
    {
      id: "201911-twice_gtmnmcl_l_full.jpg",
      src: "https://www.cinra.net/uploads/img/column/201911-twice_gtmnmcl_l_full.jpg",
      textLine: ["text1","text2"],
      textColor: "#ff3366",
      fontSize: 50,
    }

]

const imagesize = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      URL.revokeObjectURL(img.src);
      resolve(size);
    };
    img.onerror = (error) => {
      reject(error);
    };

    img.src = window.URL.createObjectURL(file)
  });
}

class StageTest extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        stageWidth: 0,
        stageHeight: 0,
        transform: "scale(0.5)",
        images: [],
        currentImage:{textLine: [], textColor: defaultTextColor, fontSize: defaultFontSize},
        currentImageIndex: 0,
    }
    this.setStageSize = this.setStageSize.bind(this);
    this.setImages = this.setImages.bind(this);
    this.setText = this.setText.bind(this);
    this.setFiles = this.setFiles.bind(this);
    this.setCurrentImage = this.setCurrentImage.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.setDefaultImageValue = this.setDefaultImageValue.bind(this);

    this.imageRef = React.createRef();
  }

  componentDidMount() {
    console.log("Did Mount")
    this.setStageSize()
    this.setImages()
  }

  componentDidUpdate() {
    console.log("Did Update")
  }

  setStageSize() {
    console.log("setStageSize")
    this.setState({stageWidth: stageWidth})
    this.setState({stageHeight: stageHeight})
  }

  setImages() {
    console.log("set Images")

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
    let naturalWidth = 0;
    let size = imageObj.onload = () => {
      return {width: imageObj.naturalWidth, height: imageObj.naturalHeight}
    }
    selectedImage.image = imageObj
    selectedImage.naturalWidth = size().width
    selectedImage.naturalHeight = size().height
    selectedImage.scaleX = stageWidth / size().width
    selectedImage.scaleY = selectedImage.scaleX
    selectedImage.width = selectedImage.naturalWidth * selectedImage.scaleX
    selectedImage.height = selectedImage.naturalHeight * selectedImage.scaleY

    this.setState({currentImageIndex: index})
    this.setState({currentImage: this.setDefaultImageValue(selectedImage)})
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

  setFiles(e) {
    e.preventDefault()
    for(var i in e.target.files) {
      if (event.target.files[i].type == undefined) {
        continue;
      }
      var url = window.URL.createObjectURL(event.target.files[i])
      let newItem = {
        src: url,
        id: 'rect' + (this.state.images.length + 1),
      }

      let newImages = this.state.images
      newImages.push(newItem);
      this.setState({images: newImages})
    }
  }

  handleDragEnd() {
    // x: e.target.x(),
  }

  render() {

    return(
      <React.Fragment>
      <div className="container-fluid">
        <div className="row">
          {this.state.images.map((thumbnail, i) => {
            return(
              <div key={"thumbnail-" + i} className="col-3 col-lg-1">
                <img src={thumbnail.src} width={thumbnailWidth} onClick={() => this.setCurrentImage(i)} />
              </div>
            )
          })}
        </div>
        <div key="current-div" className="row">
          <div className="col-sm-6">
            <Stage 
              width={window.innerWidth} 
              height={window.innerHeight}
              scaleX={0.5}
              scaleY={0.5}
            >
              <Layer>
                <Rect
                  key={"currentRect"}
                  x={20}
                  y={50}
                  width={this.state.currentImage.width}
                  height={this.state.currentImage.height}
                  fillPatternImage={this.state.currentImage.image}
                  fillPatternScaleX={this.state.currentImage.scaleX}
                  fillPatternScaleY={this.state.currentImage.scaleY}
                  shadowBlur={5}
                />
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
                      height={100}
                      y={40 * i}
                      fill={this.state.currentImage.textColor}
                      draggable={true}
                      onDragEnd={this.handleDragEnd}
                      style={{ transform: `${ this.state.transform }` }}
                    />
                  )})}

              </Layer>
            </Stage>
          </div>
          <div className="col-sm-6">
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

