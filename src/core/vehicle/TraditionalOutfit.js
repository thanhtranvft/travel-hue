import * as THREE from "three";

export function addTraditionalOutfit(rig, female) {
  const cloth = new THREE.MeshPhysicalMaterial({color:female?"#fffdf8":"#111316",roughness:.53,side:THREE.DoubleSide,sheen:.35,sheenColor:female?"#ffffff":"#43464a"});
  const dark = new THREE.MeshStandardMaterial({color:"#14141b",roughness:.8});
  const silk = new THREE.MeshStandardMaterial({color:"#f0eee5",roughness:.62});
  const add=(parent,geometry,material,x,y,z,name)=>{
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.name=name;mesh.castShadow=true;parent.add(mesh);return mesh;
  };
  // Follow the original articulated skeleton, including bicycle and seated poses.
  rig.torsoPivot.traverse(o=>{if(o.isMesh && ["dc2f2f","f8fafc"].includes(o.material?.color?.getHexString()))o.visible=false;});
  rig.bodyPivot.traverse(o=>{if(o.isMesh && ["22324c","2b3854"].includes(o.material?.color?.getHexString()))o.visible=false;});
  rig.headPivot.scale.setScalar(.88);
  rig.torsoPivot.getObjectByName("chibi-backpack")?.removeFromParent();
  rig.hairPigtailL && (rig.hairPigtailL.visible=false);
  rig.hairPigtailR && (rig.hairPigtailR.visible=false);
  add(rig.torsoPivot,new THREE.CylinderGeometry(.158,.173,.31,20),cloth,0,.17,0,"ao-dai-bodice");
  add(rig.torsoPivot,new THREE.CylinderGeometry(.088,.105,.09,18),cloth,0,.34,0,"ao-dai-standing-collar");
  if(!female){
    const lining=new THREE.MeshStandardMaterial({color:"#efeee5",roughness:.8});
    add(rig.torsoPivot,new THREE.CylinderGeometry(.09,.09,.018,18),lining,0,.385,0,"scholar-white-inner-collar");
  }
  const panels=[];
  for(const sign of [-1,1]){
    const pivot=new THREE.Group();pivot.position.set(0,.06,0);rig.torsoPivot.add(pivot);
    const geometry=new THREE.CylinderGeometry(.19,.24,.43,18,8,true,sign===1?-Math.PI*.43:Math.PI*.57,Math.PI*.86);
    const positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const y=positions.getY(i),v=(.215-y)/.43;
      positions.setXYZ(i,positions.getX(i),y-.20,positions.getZ(i)*.85+sign*Math.sin(v*Math.PI)*.006);
    }
    geometry.computeVertexNormals();
    const panel=add(pivot,geometry,cloth,0,0,0,sign===1?"ao-dai-front-panel":"ao-dai-back-panel");
    panel.userData.basePositions=positions.array.slice();panels.push({pivot,panel,sign});
  }
  for(const leg of [rig.leftLeg,rig.rightLeg]){
    add(leg,new THREE.CylinderGeometry(.078,.074,.19,12),silk,0,-.08,0,"ao-dai-trouser-upper");
    add(leg.shin,new THREE.CylinderGeometry(.073,.079,.22,12),silk,0,-.10,0,"ao-dai-trouser-lower");
  }
  for(const arm of [rig.leftArm,rig.rightArm]){
    add(arm,new THREE.CylinderGeometry(.065,.06,.18,12),cloth,0,-.06,0,"ao-dai-sleeve");
    add(arm.forearm,new THREE.CylinderGeometry(.057,.06,.15,12),cloth,0,-.055,0,"ao-dai-cuff");
  }
  if(female){
    const hair=add(rig.headPivot,new THREE.SphereGeometry(.245,18,14),dark,0,.12,-.105,"ao-dai-long-hair");
    hair.scale.set(.92,1.3,.42);
    const straw=new THREE.MeshStandardMaterial({color:"#d8b77b",roughness:.9,side:THREE.DoubleSide});
    const hat=add(rig.headPivot,new THREE.ConeGeometry(.44,.23,40,1,true),straw,0,.61,0,"ao-dai-conical-hat");
    for(const radius of [.12,.23,.34,.43]){
      const ring=add(hat,new THREE.TorusGeometry(radius,.004,4,40),dark,0,.115-radius*.23/.44,0,"hat-woven-ring");
      ring.rotation.x=Math.PI/2;
    }
    const ribbon=new THREE.MeshStandardMaterial({color:"#b597bd",roughness:.85});
    for(const side of [-1,1]){
      const strap=add(rig.headPivot,new THREE.CylinderGeometry(.008,.008,.32,6),ribbon,side*.19,.28,.06,"hat-chin-ribbon");
      strap.rotation.z=side*.35;
    }
  }else{
    add(rig.headPivot,new THREE.SphereGeometry(.249,24,14,0,Math.PI*2,0,Math.PI/2),cloth,0,.43,-.01,"scholar-wrapped-cap").scale.y=.58;
    for(let i=0;i<3;i++){
      const wrap=add(rig.headPivot,new THREE.TorusGeometry(.245-i*.009,.016,8,32),cloth,0,.44+i*.018,-.01,`khan-dong-wrap-${i}`);
      wrap.rotation.x=Math.PI/2;
    }
    const frames=new THREE.MeshStandardMaterial({color:"#a9976d",roughness:.3,metalness:.7});
    const glasses=new THREE.Group();glasses.name="scholar-sunglasses";rig.headPivot.add(glasses);
    for(const side of [-1,1]){
      add(glasses,new THREE.TorusGeometry(.069,.006,6,24),frames,side*.087,.28,.258,"scholar-round-glasses");
      add(glasses,new THREE.BoxGeometry(.009,.009,.16),frames,side*.16,.28,.185,"glasses-temple");
    }
    add(rig.headPivot,new THREE.BoxGeometry(.065,.013,.016),dark,0,.28,.25,"sunglasses-bridge");
    const wood=new THREE.MeshStandardMaterial({color:"#634027",roughness:.65});
    const cane=new THREE.Group();cane.name="scholar-walking-cane";
    cane.position.set(0,-.16,.025);rig.rightArm.forearm.add(cane);
    add(cane,new THREE.CylinderGeometry(.014,.019,.70,10),wood,0,-.35,0,"cane-shaft");
    add(cane,new THREE.SphereGeometry(.035,10,8),wood,0,.01,0,"cane-handle");
    add(cane,new THREE.CylinderGeometry(.021,.023,.035,8),dark,0,-.70,0,"cane-rubber-tip");
    rig.traditionalCane=cane;
  }
  rig.traditionalPanels=panels;
}

export function animateTraditionalOutfit(rig, {speed=0,phase=0,idleTime=0,stance="idle"}) {
  if(rig.traditionalCane)rig.traditionalCane.visible=["idle","walk","run"].includes(stance);
  for(const {pivot,panel,sign} of rig.traditionalPanels || []){
    const seated=["bike","fish","boat","cruise"].includes(stance);
    pivot.rotation.x=seated?sign*.8:Math.sin(phase+sign)*Math.min(.15,Math.abs(speed)*.025);
    const pos=panel.geometry.attributes.position,base=panel.userData.basePositions;
    for(let i=0;i<pos.count;i++){
      const weight=Math.max(0,-base[i*3+1]/.4);
      pos.setZ(i,base[i*3+2]+Math.sin(idleTime*3.2+weight*4+sign)*weight*(.012+Math.min(.04,Math.abs(speed)*.006)));
    }
    pos.needsUpdate=true;
  }
}
