import React, {Component} from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import "./ImageStageF.css"


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
        draggable
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


const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: 'red',
    id: 'rect1',
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: 'green',
    id: 'rect2',
  },
];

class ImageStageF extends React.Component{

  constructor(props) {
    super(props)
    this.state = {
      rectangles: initialRectangles,
      selectedId: '',
      canvasWidth: window.screen.width,
      canvasHeight: window.screen.height,
      lastCenter: {},
      lastDist: 0
    }
    this.imageRef = React.createRef();
    this.stageRef = React.createRef();
    this.layerRef = React.createRef();
    
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.checkDeselect = this.checkDeselect.bind(this);
    this.setCanvasSize = this.setCanvasSize.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.getCenter = this.getCenter.bind(this);
    this.getDistance = this.getDistance.bind(this);
    console.log(this.state)
  }

  componentDidUpdate() {
  }

  componentDidMount() {
    this.setCanvasSize()
    window.addEventListener('resize', this.setCanvasSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setCanvasSize);
  }

  setCanvasSize() {
  
//    let displayAspectRetioY = window.screen.availHeight / window.screen.availWidth
//    let canvasScale = window.innerWidth / window.parent.screen.width
//    this.setState({canvasWidth: window.innerWidth})
//    this.setState({canvasHeight: window.innerWidth * displayAspectRetioY})
     
      this.setState({canvasWidth: window.screen.width})
      this.setState({canvasHeight: window.screen.height})
  }

  checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      this.setState({selectedId: null});
    }
  }

  handleChange(e) {
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
    // e.evt.preventDefault()
    // let activeShape = this.state.selectedId
    let activeShape = e.target
    
    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];

    if (touch1 && touch2 && activeShape) {
      this.stageRef.current.stopDrag();
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
      this.layerRef.current.batchDraw();
      this.setState({lastDist: dist});
    }
  }

  handleChangeFile(e) {
    e.preventDefault()

    for(var i in e.target.files) {
      let reader = new FileReader()
      let file = e.target.files[i]
  
      console.log(file.type)
      if (!file || (file.type != 'image/jpeg' && file.type != 'image/png' )) {
        continue;
      }

      let image = new window.Image();
      reader.onloadend = () => {
        image.src = reader.result;
        image.onload = () => {
  
          let imageCanvasRetio = ( this.state.canvasWidth / image.naturalWidth)
          let newItem = {
            x: 0,
            y: 0,
            width:  image.naturalWidth,
            height: image.naturalHeight,
            imgSrc: reader.result,
            id: 'rect' + (this.state.rectangles.length + 1),
          }
  
          let newRectangles = this.state.rectangles
          newRectangles.push(newItem);
          this.setState({rectangles: newRectangles})
        }
      }
      reader.readAsDataURL(file)
    }
  }


  render() {
    return (
      <React.Fragment>
      <input type="file" ref={this.imageRef} onChange={this.handleChangeFile} multiple />
      <input type="text" size="4" name="canvasWidth" value={this.state.canvasWidth} onChange={this.handleChange} /> 
      <input type="text" size="4" name="canvasHeight" value={this.state.canvasHeight} onChange={this.handleChange} /> 

      <li>{window.screen.width}</li>
      <li>{window.screen.height}</li>
      {this.state.rectangles.map((rect, i) => {
        let fragKey = "frag" + i
        let widthKey = "width" + i
        let heightKey = "height" + i
        return(
          <React.Fragment key={fragKey}>
            <input key={widthKey} type="text" size="4" name="rectWidth" value={rect.width} onChange={this.handleChange} /> 
            <input key={heightKey} type="text" size="4" name="rectHeight" value={rect.height} onChange={this.handleChange} /> 
          </React.Fragment>
        )
      })}
      <Stage
        ref={this.stageRef}
        width={this.state.canvasWidth}
        height={this.state.canvasHeight}
        onMouseDown={this.checkDeselect}
        onTouchStart={this.checkDeselect}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={() => {
          this.setState({lastDist: 0})
        }}
        className='canvas'
        style={{width: `${ this.state.canvasWidth }`, height: `${ this.state.canvasHeight }`}}
      >
        <Layer ref={this.layerRef}>
          {this.state.rectangles.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                shapeProps={rect}
                isSelected={rect.id === this.state.selectedId}
                onSelect={() => {
                  this.setState({selectedId: rect.id});
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
        </Layer>
      </Stage>
      </React.Fragment>
    );
  }
}

export default ImageStageF
