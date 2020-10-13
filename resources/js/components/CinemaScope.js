import React, {Component} from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Transformer, Text } from 'react-konva';
import "./CinemaScope.css"


const Rectangle = ({ shapeProps, isSelected, onSelect, onChange, stage }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();
  const stageRef = React.useRef();
  const layerRef = React.useRef();
  const [fillPatternImage, setFillPattnerImage] = React.useState(null);
  const [fillPatternScaleX, setFillPatternScaleX] = React.useState(1);
  const [fillPatternScaleY, setFillPatternScaleY] = React.useState(1);
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
const initialRectangles = [
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
      rectangles: initialRectangles,
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
      this.setState({canvasWidth: 1280})
      this.setState({canvasHeight: 720})
    this.setCanvasSize()
    window.addEventListener('resize', this.setCanvasSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setCanvasSize);
  }

  setCanvasSize(e) {
  
      // this.layerRef.hitCanvas.context.scale(0.5, 0.5);

//    let displayAspectRetioY = window.screen.availHeight / window.screen.availWidth
//    let canvasScale = window.innerWidth / window.parent.screen.width
//      let canvasWidth = (this.stageRef.attrs.container.offsetWidth > 600) ? 600 : this.stageRef.attrs.container.offsetWidth;
      // let canvasWidth = this.stageRef.attrs.container.offsetWidth;

      let scaleX = window.screen.width / this.state.canvasWidth
      console.log(window.screen.width)
      console.log(scaleX)
      let heightTragetValue = this.state.canvasHeight * scaleX
      let scaleY =  heightTragetValue / this.state.canvasHeight
      this.setState({transform: 'scale(' + scaleX + ',' + scaleY + ')'})
//      let retio =  0.75
//      let canvasHeight = canvasWidth * retio; 
      let maskHeight = 0
      maskHeight =  (this.state.canvasHeight - this.state.canvasWidth  / 2.39) / 2

//      if ( this.stageRef.current.attrs.container.offsetHeight > this.stageRef.current.attrs.container.offsetWidth ) {
//        maskHeight =  (this.stageRef.current.attrs.container.offsetHeight * 0.239) / 2
//      } else {
//        maskHeight =  (this.stageRef.current.attrs.container.offsetHeight - this.stageRef.current.attrs.container.offsetWidth  / 2.39) / 2
//      }
//
//      // if set file resize canvas again
//      if(this.imageRef.current.files.length > 0) {
//        if(this.state.firstImageWidth > this.state.firstImageHeight) {
//            let retio = this.state.firstImageHeight / this.state.firstImageWidth 
//            let canvasHeight = this.stageRef.current.attrs.container.offsetWidth * retio; 
//            this.setState({canvasHeight: canvasHeight})
//            maskHeight =  (canvasHeight - canvasWidth  / 2.39) / 2
//        }
//      }


      let newRectangles = []
      this.state.rectangles.map((rect, i) => {

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
        newRectangles.push(rect)
      })
      this.setState({rectangles: newRectangles})

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
    console.log("stagegg")
    console.log(activeShape.attrs)
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
            width:  image.naturalWidth,
            height: image.naturalHeight,
            imgSrc: reader.result,
            id: 'rect' + (this.state.rectangles.length + 1),
          }

          this.setState({firstImageWidth: image.naturalWidth})
          this.setState({firstImageHeight: image.naturalHeight * scaleContainer})
          let newRectangles = this.state.rectangles
          newRectangles.unshift(newItem);
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
      <div className="m-2">
        <div className="text-right">
            canvas:{this.state.canvasWidth} x {this.state.canvasHeight} 
        </div>
        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text">Text</span>
          </div>
          <input type="text" className="form-control" name="bottomText" value={this.state.bottomText} onChange={this.handleChange} />
        </div>
  
        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text">File</span>
          </div>
          <div className="custom-file">
              <input id="imagefile" ref={this.imageRef} onChange={this.handleChangeFile} type="file" className="custom-file-input" id="inputFile" multiple />
              <label for="imagefile" className="custom-file-label" for="inputFile" data-browse="参照">ファイルを選択(ここにドロップすることもできます)</label>
          </div>
        </div>
        <div>
          <input type="button" value="DownLoad" onClick={this.handleExportClick} />
        </div>
        <div>
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
          >
            {this.state.rectangles.map((rect, i) => {
              return (
                <Rectangle
                  key={i}
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
            <Text
              fontSize={this.state.canvasWidth * 0.036}
              text={this.state.bottomText}
              wrap="char"
              align="center"
              width={this.state.canvasWidth}
              height={this.state.maskHeight}
              y={this.state.bottomBarY + 20}
              fill="white"
              draggable={true}
              style={{ transform: `${ this.state.transform }` }}
            />
          </Layer>
        </Stage>
        </div>
        {/*
        {this.state.rectangles.map((rect, i) => {
          let fragKey = "frag" + i
          let widthKey = "width" + i
          let heightKey = "height" + i
          return(
            <React.Fragment key={fragKey}>
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text">Image</span>
                </div>
                <input key={widthKey} type="text" size="4" name="rectWidth" value={rect.width} onChange={this.handleChange} /> 
                <input key={heightKey} type="text" size="4" name="rectHeight" value={rect.height} onChange={this.handleChange} /> 
              </div>
            </React.Fragment>
          )
        })}
        */}
      </div>
      </React.Fragment>
    );
  }
}

export default CinemaScope
