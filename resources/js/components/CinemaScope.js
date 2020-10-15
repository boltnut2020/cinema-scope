import React, {Component} from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Transformer, Text } from 'react-konva';
import "./CinemaScope.css"

const canvasWidth = 1280
const canvasHeight = 960

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange, stage }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();
  const stageRef = React.useRef();
  const layerRef = React.useRef();
  const [fillPatternImage, setFillPattnerImage] = React.useState(null);
  const [fillPatternScaleX, setFillPatternScaleX] = React.useState(0.3);
  const [fillPatternScaleY, setFillPatternScaleY] = React.useState(0.3);
  const [lastCenter, setLastCenter] = React.useState(null);
  const [lastDist, setLastDist] = React.useState(0);
  const stageProp = stage
  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  
  let image = new window.Image();
  image.src = shapeProps.imgSrc;

  let isDraggable = (shapeProps.id !== "topbar" && shapeProps.id !== "bottombar") ? true:false;
  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        fillPatternImage={image}
        fillPatternScaleX={fillPatternScaleX}
        fillPatternScaleY={fillPatternScaleY}
        fillPatternRepeat="no-repeat"
        draggable={isDraggable}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          setFillPatternScaleX(fillPatternScaleX * scaleX)
          setFillPatternScaleY(fillPatternScaleY * scaleY)
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
        
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};


const windowWidth = window.screen.width;
const windowHeight = window.screen.height;
const maskRectangles = [
  {
    x: 0,
    y: 0,
    width: windowWidth,
    height: 100,
    fill: 'black',
    id: 'topbar',
  },
  {
    x: 0,
    y: 0,
    width: windowWidth,
    height: 100,
    fill: 'black',
    id: 'bottombar',
  },
];

class CinemaScope extends React.Component{

  constructor(props) {
    super(props)
    this.state = {
      rectangles: [],
      maskRectangles: [],
      selectedId: '',
      canvasWidth: 0,
      canvasHeight: 0,
      scaleX: 1,
      scaleY: 1,
      transform: 'scale(1,1)',
      lastCenter: {},
      lastDist: 0,
      maskHeight: 0,
      bottomBarY: 0,
      firstImageWidth:0,
      firstImageHeight:0,
      bottomText: ""
    }
    this.imageRef = React.createRef();
    // this.stageRef = React.createRef();
    
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.checkDeselect = this.checkDeselect.bind(this);
    this.setCanvasSize = this.setCanvasSize.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.getCenter = this.getCenter.bind(this);
    this.getDistance = this.getDistance.bind(this);
    this.handleExportClick = this.handleExportClick.bind(this);
  }

  componentDidUpdate() {
  }

  componentDidMount() {
    this.setState({canvasWidth: canvasWidth})
    this.setState({canvasHeight: canvasHeight})
    this.setCanvasSize()
    window.addEventListener('resize', this.setCanvasSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setCanvasSize);
  }

  setCanvasSize(e) {
  
      var scaleX = 1
      if ( window.screen.width > 768 && window.innerWidth > 768) {
        scaleX = 768 / this.state.canvasWidth
      } else {
        scaleX = window.screen.width / this.state.canvasWidth * 0.93
      }
      // scaleX = window.screen.width / this.state.canvasWidth
      let heightTragetValue = this.state.canvasHeight * scaleX
      let scaleY =  heightTragetValue / this.state.canvasHeight
      this.setState({transform: 'scale(' + scaleX + ',' + scaleY + ')'})
      let maskHeight = 0
      maskHeight =  (this.state.canvasHeight - this.state.canvasWidth  / 2.35) / 2

      let newMaskRectangles = []
      maskRectangles.map((rect, i) => {

        if(rect.id == "topbar") {
            rect.width = this.state.canvasWidth
            rect.height = maskHeight
        }

        if(rect.id == "bottombar") {
            rect.width = this.state.canvasWidth
            rect.y = this.state.canvasHeight - maskHeight
            rect.height = maskHeight
            this.setState({bottomBarY: rect.y})
        }
        newMaskRectangles.push(rect)
      })
      this.setState({maskRectangles: newMaskRectangles})
  }

  checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      this.setState({selectedId: null});
    }
  }

  handleChange(e) {
    if (event.target.name == "bottomText") {
      if (this.state.bottomText !== event.target.name) {
        this.setState({bottomText: event.target.value});
      }
    }
  }

  getCenter(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  handleTouchMove(e){
    
    e.evt.preventDefault()
    // let activeShape = this.state.selectedId
    let activeShape = e.target
    if ( activeShape.attrs.id == "canvas" || activeShape.attrs.id == "topbar" || activeShape.attrs.id == "bottombar") {
        return false
    }

    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];

    if (touch1 && touch2 && activeShape) {
      this.stageRef.stopDrag();
      var dist = this.getDistance(
        {
          x: touch1.clientX,
          y: touch1.clientY,
        },
        {
          x: touch2.clientX,
          y: touch2.clientY,
        }
      );

      if (!this.state.lastDist) {
        this.setState({lastDist: dist});
      }

      var scale = (activeShape.scaleX() * dist) / this.state.lastDist;

      activeShape.scaleX(scale);
      activeShape.scaleY(scale);
      this.layerRef.batchDraw();
      this.setState({lastDist: dist});
    }
  }

  handleChangeFile(e) {
    e.preventDefault()

    for(var i in e.target.files) {
      let reader = new FileReader()
      let file = e.target.files[i]
      if (!file || (file.type != 'image/jpeg' && file.type != 'image/png' )) {
        continue;
      }

      let image = new window.Image();
      reader.onloadend = () => {
        image.src = reader.result;
        image.onload = () => {
  
          let scaleContainer = this.state.canvasWidth /image.naturalWidth
          let newItem = {
            x: 0,
            y: this.state.maskHeight,
            width:  image.naturalWidth * 0.3,
            height: image.naturalHeight * 0.3,
            imgSrc: reader.result,
            id: 'rect' + (this.state.rectangles.length + 1),
          }

          this.setState({firstImageWidth: image.naturalWidth})
          this.setState({firstImageHeight: image.naturalHeight * scaleContainer})
          let newRectangles = this.state.rectangles
          newRectangles.push(newItem);
          this.setState({rectangles: newRectangles})
        }
      }
      reader.readAsDataURL(file)
    }
    this.setCanvasSize()
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
    return (
      <React.Fragment>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-7 order-sm-12 order-12 order-md-12">
            Canvas
            <Stage
              id={"canvas"}
              ref={node => { this.stageRef = node}}
              width={this.state.canvasWidth}
              height={this.state.canvasHeight}
              onMouseDown={this.checkDeselect}
              onTouchStart={this.checkDeselect}
              onTouchMove={this.handleTouchMove}
              onTouchEnd={() => {
                this.setState({lastDist: 0})
              }}
              className='canvas'
              draggable={false}
              style={{width: `${ this.state.canvasWidth }` , height: `${ this.state.canvasHeight }` , transform: `${ this.state.transform }` }}
            >
              <Layer 
                ref={node => {this.layerRef = node}}
                style={{width: `${ this.state.canvasWidth }` , height: `${ this.state.canvasHeight }` , transform: `${ this.state.transform }` }}
              >
                {this.state.rectangles.map((rect, i) => {
                  return (
                    <Rectangle
                      key={rect.id}
                      shapeProps={rect}
                      isSelected={rect.id === this.state.selectedId}
                      onSelect={() => {
                        if(rect.id === this.state.selectedId) {
                          this.setState({selectedId: null});
                        } else {
                          this.setState({selectedId: rect.id});
                        }
      
                        if (rect.id == "topbar" || rect.id == "bottombar") {
                          this.setState({selectedId: null});
                        }
                      }}
                      onChange={(newAttrs) => {
                        const rects = this.state.rectangles.slice();
                        rects[i] = newAttrs;
                        this.setState({rectangles: rects});
                      }}
                      stage={this.stageRef}
                    />
                  );
                })}
    
                {this.state.maskRectangles.map((rect, i) => {
                  return (
                    <Rectangle
                      key={rect.id}
                      shapeProps={rect}
                      isSelected={rect.id === this.state.selectedId}
                      onSelect={() => {
                        if(rect.id === this.state.selectedId) {
                          this.setState({selectedId: null});
                        } else {
                          this.setState({selectedId: rect.id});
                        }
      
                        if (rect.id == "topbar" || rect.id == "bottombar") {
                          this.setState({selectedId: null});
                        }
                      }}
                      onChange={(newAttrs) => {
                        const rects = this.state.rectangles.slice();
                        rects[i] = newAttrs;
                        this.setState({rectangles: rects});
                      }}
                      stage={this.stageRef}
                    />
                  );
                })}
    
                {this.state.bottomText.split("\n").map((line, i) => {
                var positionY = i * 60
                var key = "bottomText" + i
                return(
                  <Text
                    key={key}
                    fontSize={this.state.canvasWidth * 0.030}
                    text={line}
                    wrap="char"
                    align="center"
                    width={this.state.canvasWidth}
                    height={this.state.maskHeight}
                    y={this.state.bottomBarY + 15 + positionY}
                    fill="white"
                    draggable={true}
                    style={{ transform: `${ this.state.transform }` }}
                  />
                )})}
              </Layer>
            </Stage>
  
          </div>
          <div className="col-md-5 order-sm-2 order-2 order-md-2">
            <div class="card text-dark">
              <div class="card-header">
                Featured
              </div>
              <div className="card-body">
                  <h5 classNmae="card-title">出来る事</h5>
                  <p>
                  ・ブラウザ上で簡単にシネマスコープ比率のマスキング画像を作成。<br />
                  ・下の黒帯に字入れ。<br />
                  ・表示されている画像をダウンロード。
                  </p>
                  <p>
                    ※  PC, AndroidスマホのGoogle Chromeで動作確認済み<br />
                    ※  10MBを超える画像はレンダリングされないケースがあります。<br />
                    (2～3MB上限を推奨)
                  </p>
              </div>
            </div>

            <div className="text-right">
                canvas:{this.state.canvasWidth} x {this.state.canvasHeight} 
            </div>
      
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">1. File</span>
              </div>
              <div className="custom-file">
                  <input id="imagefile" ref={this.imageRef} onChange={this.handleChangeFile} type="file" className="custom-file-input" id="inputFile" multiple />
                  <label htmlFor="imagefile" className="custom-file-label" for="inputFile" data-browse="参照">ファイルを選択(2～3MBを上限)</label>
              </div>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">2. Text</span>
              </div>
              <textarea type="text" className="form-control" name="bottomText" value={this.state.bottomText} onChange={this.handleChange} placeholder="下帯に表示させるテキストを入力" />
            </div>

            <div>
              <input className="btn btn-light" type="button" value="3. DownLoad" onClick={this.handleExportClick} />
            </div>
          </div>
        </div>
      </div>
      </React.Fragment>
    );
  }
}

export default CinemaScope
