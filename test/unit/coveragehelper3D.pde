// unit test for 3D code coverage tool to bring coverage percent up
size(500,500,OPENGL);

ambientLight(51, 102, 126);
translate(20, 50, 0);
directionalLight(51, 102, 126, -1, 0, 0);
sphere(30);
translate(60, 0, 0);
sphere(30);
ortho(0, 100, 0, 100, -10, 10);

lights();
noLights();
spotLight(51, 102, 126, 80, 20, 40, -1, 0, 0, PI/2, 2);

beginCamera();

box(10);
box(40, 20, 50);

sphereDetail(mouseX / 4);
sphere(40);

ambient(51, 26, 0);
emissive(0, 26, 51);

screenX(5, 5, 5);
screenY(5, 5, 5);
screenZ(5, 5, 5);

point(85, 75, 60);
