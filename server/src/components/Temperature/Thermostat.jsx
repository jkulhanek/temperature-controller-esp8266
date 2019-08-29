import React from 'react';
import PropTypes from 'prop-types';

function roundHalf(num) {
    return (Math.round(num*2)/2).toFixed(1);
}

function setClass(el, className, state) {
    el.classList[state ? 'add' : 'remove'](className);
}

export default class Thermostat extends React.Component {
  constructor(props) {
    super(props);
    this._drag = {
			inProgress: false,
			startPoint: null,
			startTemperature: 0,
			lockAxis: undefined
    };

    this.options = {
      diameter: 400,
    }

    this.properties = {
      dragLockAxisDistance: 15,
    }

    this.refreshProperties();
    
    this.dragEnd = this.dragEnd.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragStart = this.dragStart.bind(this);
    this.getSizeRatio = this.getSizeRatio.bind(this);
  }
    getStyles() {
      // Determine if the thermostat is actively working to reach the target temperature.
      let dialColor = '#222';
      if (this.props.hvacMode === 'heating') {
        dialColor = '#E36304';
      } else if (this.props.hvacMode === 'cooling') {
        dialColor = '#007AF1';
      }
  
      return {
        dial: {
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
        },
        circle: {
          fill: dialColor,
          WebkitTransition: 'fill 0.5s',
          transition: 'fill 0.5s',
        },
        target: {
          fill: 'white',
          textAnchor: 'middle',
          fontFamily: 'Helvetica, sans-serif',
          alignmentBaseline: 'central',
          fontSize: '120px',
          fontWeight: 'bold',
          visibility: (this.props.away ? 'hidden' : 'visible'),
        },
        ambient: {
          fill: 'white',
          textAnchor: 'middle',
          fontFamily: 'Helvetica, sans-serif',
          alignmentBaseline: 'central',
          fontSize: '22px',
          fontWeight: 'bold',
        },
        away: {
          fill: 'white',
          textAnchor: 'middle',
          fontFamily: 'Helvetica, sans-serif',
          alignmentBaseline: 'central',
          fontSize: '72px',
          fontWeight: 'bold',
          opacity: (this.props.away ? '1' : '0'),
          pointerEvents: 'none',
        },
        leaf: {
          fill: '#13EB13',
          opacity: (this.props.leaf ? '1' : '0'),
          visibility: (this.props.away ? 'hidden' : 'visible'),
          WebkitTransition: 'opacity 0.5s',
          transition: 'opacity 0.5s',
          pointerEvents: 'none',
        },
      };
    }
  
    pointsToPath(points) {
      return [points.map(
        (point, iPoint) => [(iPoint > 0 ? 'L' : 'M'), point[0], ' ', point[1]].join('')
      ).join(' '), 'Z'].join('');
    }
  
    rotatePoint(point, angle, origin) {
      const radians = angle * Math.PI / 180;
      const x = point[0] - origin[0];
      const y = point[1] - origin[1];
      const x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0];
      const y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1];
      return [x1, y1];
    }
  
    rotatePoints(points, angle, origin) {
      const _self = this;
      return points.map(
        (point) => _self.rotatePoint(point, angle, origin)
      );
    }
  
    restrictToRange(val, min, max) {
      if (val < min) return min;
      if (val > max) return max;
      return val;
    }
  
    mapLeafPoint(point, scale) {
      return isNaN(point) ? point : point * scale;
    }
		
		eventPosition(ev) {
			if (ev.targetTouches && ev.targetTouches.length) {
				return  [ev.targetTouches[0].clientX, ev.targetTouches[0].clientY];
			} else {
				return [ev.x, ev.y];
			};
    }
    
    setClass(el, className, state) {
      el.classList[state ? 'add' : 'remove'](className);
    }
		
		dragStart(ev) {
			this.startDelay = setTimeout((function() {
				this.setClass(this.svg, 'dial--edit', true);
				this._drag.inProgress = true;
				this._drag.startPoint = this.eventPosition(ev);
				this._drag.startTemperature = this.props.targetTemperature || this.options.minValue;
				this._drag.lockAxis = undefined;
			}).bind(this),1000);
		};
		
		dragEnd (ev) {
			clearTimeout(this.startDelay);
			this.setClass(this.svg, 'dial--edit', false);
			if (!this._drag.inProgress) return;
			this._drag.inProgress = false;
			// if (this.state.localTargetTemperature != this._drag.startTemperature) {
			// 	if (typeof this.props.onChange == 'function') {
			// 		this.props.onChange(this.state.localTargetTemperature);
			// 	};
			// };
    };
    
    getSizeRatio() {
			return this.options.diameter / this.targetElement.clientWidth;
		}
		
		dragMove(ev) {
			ev.preventDefault();
			if (!this._drag.inProgress) return;
			var evPos = this.eventPosition(ev);
			var dy = this._drag.startPoint[1]-evPos[1];
			var dx = evPos[0] - this._drag.startPoint[0];
			var dxy;
			if (this._drag.lockAxis == 'x') {
				dxy  = dx;
			} else if (this._drag.lockAxis == 'y') {
				dxy = dy;
			} else if (Math.abs(dy) > this.properties.dragLockAxisDistance) {
				this._drag.lockAxis = 'y';
				dxy = dy;
			} else if (Math.abs(dx) > this.properties.dragLockAxisDistance) {
				this._drag.lockAxis = 'x';
				dxy = dx;
			} else {
				dxy = (Math.abs(dy) > Math.abs(dx)) ? dy : dx;
			};
      var dValue = (dxy*this.getSizeRatio())/(this.options.diameter)*this.properties.rangeValue;
			this.props.onChange && this.props.onChange(parseInt(roundHalf(this._drag.startTemperature+dValue)));
    }
    
    componentDidMount() {
      this.svg.addEventListener('mousedown',this.dragStart);
      this.svg.addEventListener('touchstart',this.dragStart);
      
      this.svg.addEventListener('mouseup',this.dragEnd);
      this.svg.addEventListener('mouseleave',this.dragEnd);
      this.svg.addEventListener('touchend',this.dragEnd);
      
      this.svg.addEventListener('mousemove',this.dragMove);
      this.svg.addEventListener('touchmove',this.dragMove);
    }

    componentWillUnmount() {
      this.svg.removeEventListener('mousedown',this.dragStart);
      this.svg.removeEventListener('touchstart',this.dragStart);
      
      this.svg.removeEventListener('mouseup',this.dragEnd);
      this.svg.removeEventListener('mouseleave',this.dragEnd);
      this.svg.removeEventListener('touchend',this.dragEnd);
      
      this.svg.removeEventListener('mousemove',this.dragMove);
      this.svg.removeEventListener('touchmove',this.dragMove);
    }
		
    refreshProperties() {
      this.properties.rangeValue = this.props.maxValue - this.props.minValue;
    }
  
    render() {
      this.refreshProperties();
      const _self = this;
  
      // Local variables used for rendering.
      const diameter = this.options.diameter;
      const radius = diameter / 2;
      const ticksOuterRadius = diameter / 30;
      const ticksInnerRadius = diameter / 8;
      const tickDegrees = 300;
      const rangeValue = this.properties.rangeValue;

      const targetTemperature = this.props.targetTemperature;
  
      // Determine the maximum and minimum values to display.
      let actualMinValue;
      let actualMaxValue;
      if (this.props.away) {
        actualMinValue = this.props.ambientTemperature;
        actualMaxValue = actualMinValue;
      } else {
        actualMinValue = Math.min(this.props.ambientTemperature, targetTemperature);
        actualMaxValue = Math.max(this.props.ambientTemperature, targetTemperature);
      }
      const min = this.restrictToRange(Math.round((actualMinValue - this.props.minValue)
        / rangeValue * this.props.numTicks), 0, this.props.numTicks - 1);
      const max = this.restrictToRange(Math.round((actualMaxValue - this.props.minValue)
        / rangeValue * this.props.numTicks), 0, this.props.numTicks - 1);
  
      // Renders the degree ticks around the outside of the thermostat.
      const tickPoints = [
        [radius - 1, ticksOuterRadius],
        [radius + 1, ticksOuterRadius],
        [radius + 1, ticksInnerRadius],
        [radius - 1, ticksInnerRadius],
      ];
      const tickPointsLarge = [
        [radius - 1.5, ticksOuterRadius],
        [radius + 1.5, ticksOuterRadius],
        [radius + 1.5, ticksInnerRadius + 20],
        [radius - 1.5, ticksInnerRadius + 20],
      ];
      const theta = tickDegrees / this.props.numTicks;
      const offsetDegrees = 180 - (360 - tickDegrees) / 2;
      const tickArray = [];
      for (let iTick = 0; iTick < this.props.numTicks; iTick++) {
        const isLarge = iTick === min || iTick === max;
        const isActive = iTick >= min && iTick <= max;
        const tickElement = React.createElement('path', {
          key: ['tick-', iTick].join(''),
          d: this.pointsToPath(
            this.rotatePoints(
              isLarge ? tickPointsLarge : tickPoints,
              iTick * theta - offsetDegrees,
              [radius, radius])),
          style: {
            fill: isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)',
          },
        });
        tickArray.push(tickElement);
      }
  
      // Determines the positioning of the leaf, should it be displayed.
      const leafScale = radius / 5 / 100;
      const leafDef = ['M', 3, 84, 'c', 24, 17, 51, 18, 73, -6, 'C', 100, 52, 100,
        22, 100, 4, 'c', -13, 15, -37, 9, -70, 19, 'C', 4, 32, 0, 63, 0, 76, 'c',
        6, -7, 18, -17, 33, -23, 24, -9, 34, -9, 48, -20, -9, 10, -20, 16, -43, 24,
        'C', 22, 63, 8, 78, 3, 84, 'z',
      ].map(
        (point) => _self.mapLeafPoint(point, leafScale)
      ).join(' ');
      const translate = [radius - (leafScale * 100 * 0.5), radius * 1.5];
  
      // Determines whether the ambient temperature label will be displayed
      // to the left or right of the tick range.
      const lblAmbientPosition = [
        radius,
        ticksOuterRadius - (ticksOuterRadius - ticksInnerRadius) / 2,
      ];
      const peggedValue = this.restrictToRange(
        this.props.ambientTemperature,
        this.props.minValue,
        this.props.maxValue);
      let degs = tickDegrees * (peggedValue - this.props.minValue) / rangeValue - offsetDegrees;
      if (peggedValue > targetTemperature) {
        degs += 8;
      } else {
        degs -= 8;
      }
      const ambientPosition = this.rotatePoint(lblAmbientPosition, degs, [radius, radius]);
  
      // The styles change based on state.
      const styles = this.getStyles();
  
      // Piece it all together to form the thermostat display.
      return (
        <div ref={x=>this.targetElement=x}>
        <svg width={this.props.width} ref={(x)=>this.svg=x} height={this.props.height} style={styles.dial}
          viewBox={['0 0 ', diameter, ' ', diameter].join('')}
        >
          <circle cx={radius} cy={radius} r={radius} style={styles.circle}></circle>
          <g>{tickArray}</g>
          <text x={radius} y={radius} style={styles.target}>
            {roundHalf(targetTemperature)}
          </text>
          <text x={ambientPosition[0]} y={ambientPosition[1]} style={styles.ambient}>
            {(this.props.ambientTemperature).toFixed(1)}
          </text>
          <text x={radius} y={radius} style={styles.away}>AWAY</text>
          <path d={leafDef} style={styles.leaf}
            transform={['translate(', translate[0], ',', translate[1], ')'].join('')}
          ></path>
        </svg>
        </div>
      );
    }
  }
  
  Thermostat.propTypes = {
    onChange: PropTypes.func,
    /* Height of the thermostat (ex: 50% or 400px) */
    height: PropTypes.string,
    /* Width of the thermostat (ex: 50% or 400px) */
    width: PropTypes.string,
    /* Total number of ticks that will be rendered on the thermostat wheel */
    numTicks: PropTypes.number,
    /* Lowest temperature able to be displayed on the thermostat */
    minValue: PropTypes.number,
    /* Highest temperature able to be displayed on the thermostat */
    maxValue: PropTypes.number,
    /* Indicates whether or not the thermostat is in "away mode" */
    away: PropTypes.bool,
    /* Indicates whether or not the thermostat is in "energy savings mode" */
    leaf: PropTypes.bool,
    /* Actual temperature detected by the thermostat */
    ambientTemperature: PropTypes.number,
    /* Desired temperature that the thermostat attempts to reach */
    targetTemperature: PropTypes.number,
    /* Current state of operations within the thermostat */
    hvacMode: PropTypes.oneOf(['off', 'heating', 'cooling']),
  };
  
  Thermostat.defaultProps = {
    height: '100%',
    width: '100%',
    numTicks: 100,
    minValue: 10,
    maxValue: 30,
    away: false,
    leaf: false,
    ambientTemperature: 20,
    targetTemperature: 22,
    hvacMode: 'off',
  };
  