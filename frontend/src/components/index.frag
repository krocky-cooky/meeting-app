precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float data[1024];
void main(){
	vec4 c=texture2D(t,uv);
	for(int i=0;i<1024;i++){
		float l=length(uv-vec2(float(i)/1024.,data[i]/256.));
		if(l<.01)c=vec4(1,0,0,1);
	}
	gl_FragColor=c;
}