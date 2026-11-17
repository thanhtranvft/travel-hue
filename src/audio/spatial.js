export function proximityGain(distance,radius=24){return Math.max(0,1-distance/radius)**2;}
// Camera looks along (sin heading, cos heading); its screen-right vector is (-cos, sin).
export function sourcePan(dx,dz,heading){return Math.max(-1,Math.min(1,(dz*Math.sin(heading)-dx*Math.cos(heading))/Math.max(1,Math.hypot(dx,dz))));}
export function nearestAudibleSource(position,sources,radius=24){let nearest=null,distance=radius;for(const source of sources){const d=Math.hypot(source.x-position.x,source.z-position.z);if(d<distance){distance=d;nearest=source;}}return nearest?{source:nearest,distance,gain:proximityGain(distance,radius)}:null;}
