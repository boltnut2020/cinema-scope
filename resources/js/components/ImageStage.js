import React, { Component, useEffect } from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Rect, Image, Transformer } from 'react-konva';
import useImage from 'use-image';

// custom component that will handle loading image from url
// you may add more logic here to handle "loading" state
// or if loading is failed
// VERY IMPORTANT NOTES:
// at first we will set image state to null
// and then we will set it to native image instance when it is loaded
class URLImage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
       image: null,
       src: "",
       width: "",
       height: "",
       width_default: "",
       height_default: "",
       isSelected: false,
       shapeProps: {}
    }
    this.imageRef = React.createRef();
    this.shapeRef = React.createRef();
    this.handleSelected = this.handleSelected.bind(this);
  }

  componentDidMount() {
    this.loadImage();
  }

  componentDidUpdate(oldProps) {
    if (oldProps.src !== this.props.src) {
      this.setState({src: this.props.src});
      console.log("set src");
      this.loadImage();
    }
    if (oldProps.width !== this.props.width) {
      this.setState({width: this.props.width});
      console.log("set width");
      this.loadImage();
    }
    if (oldProps.height !== this.props.height) {
      this.setState({height: this.props.height});
      console.log("set height");
      this.loadImage();
    }
  }

  componentWillUnmount() {
    this.image.removeEventListener('load', this.handleLoad);
  }

  loadImage() {
    // save to "this" to remove "load" handler on unmount
    console.log('load');
    this.image = new window.Image();
    this.image.src = this.state.src;
    this.image.addEventListener('load', this.handleLoad);
  }

  handleLoad = () => {
    // after setState react-konva will update canvas and redraw the layer
    // because "image" property is changed
    this.setState({
      image: this.image
    });
    // if you keep same image object during source updates
    // you will have to update layer manually:
    // this.imageNode.getLayer().batchDraw();
  }

  handleSelected(event){
    console.log(this.imageRef.current);
    this.setState({isSelected: true})
    this.imageRef.current.getLayer().batchDraw();
  }

  onChange(event) {
    console.log(event)
  }

  render() {
    return (
      <React.Fragment>
      {/*
      <Image
        x={this.props.x}
        y={this.props.y}
        width={this.state.width}
        height={this.state.height}
        image={this.state.image}
        ref={node => {
          this.imageNode = node;
        }}
        draggable="true"
        isSelected={this.state.isSelected}
        onClick={this.handleSelected}
        onTap={this.handleSelected}
        onSelect={this.handleSelected}
        onChange={this.handleChange}
      />*/}
      <Rect
        x={10} y={10} width={this.state.width} height={this.state.height}
        ref={this.shapeRef}
        onClick={this.handleSelected}
        onTap={this.handleSelected}
        fillPatternImage={this.state.image}
        draggable
        onDragEnd={(e) => {
          this.onChange({
            ...this.shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = this.imageRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
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
      {this.isSelected && (
        <Transformer
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
  }
}

class ImageStage extends Component {

  constructor(props) {
    super(props);
    this.state = {
       src: "",
       width: "",
       height: "",
       width_default: "",
       height_default: ""
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.fileInput = React.createRef();
  }

  handleChange(event) {
    if (event.target.name == "src") {
        if (this.state.src !== event.target.name) {
         this.setState({src: event.target.name});
        }
    }

    if (event.target.name == "width") {
        if (this.state.width !== event.target.value) {
            this.setState({width: event.target.value});
        }
    }

    if (event.target.name == "height") {
        if (this.state.height !== event.target.value) {
            this.setState({height: event.target.value});
        }
    }

    if (event.target.name == "init") {
        console.log("init init");
            this.setState({width: this.state.width_default});
            this.setState({height: this.state.height_default});
    }
  }

  handleChangeFile(event) {
    event.preventDefault()
    let reader = new FileReader()
    let file = event.target.files[0]

    let image = new window.Image();
    reader.onloadend = () => {
      image.src = reader.result;
      image.onload = () => {
        this.setState({width_default: image.naturalWidth});
        this.setState({height_default: image.naturalHeight});
        this.setState({width: image.naturalWidth});
        this.setState({height: image.naturalHeight});
      }

      this.setState({
        file: file,
        src: reader.result,
      }); 
    }
    reader.readAsDataURL(file)
  }

  render() {
    return (
      <React.Fragment>
      <input type="text" name="width" value={this.state.width} onChange={this.handleChange} />
      <input type="text" name="height" value={this.state.height} onChange={this.handleChange} />
      <input type="text" name="src" value={this.state.src} onChange={this.handleChange} />
      <input type="button" name="init" value="Init size" onClick={this.handleChange} />
      <input type="file" ref={this.state.src} onChange={this.handleChangeFile} />
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <URLImage src={this.state.src} width={this.state.width} height={this.state.height} x={50} />
          {/*
          <URLImage src={this.state.value} x={50} width={285.18} height={141.59} />
          <URLImage src={this.state.value} x={335.18} width={285.18} height={141.59} />
          <URLImage src={this.state.value} x={50} y={141.59} width={285.18} height={141.59} />
          <URLImage src={this.state.value} x={335.18} y={141.59} width={285.18} height={141.59} />
          */}
        </Layer>
      </Stage>
      </React.Fragment>
    );
  }
}

export default ImageStage
