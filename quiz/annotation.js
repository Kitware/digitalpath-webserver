// Spa little theater
// Sat and Sun 1pm,
// Rehersal 5:30pm Friday.


function Annotation(location, string, color) {
    this.Glyph = new Circle();
    this.Glyph.Center = location;
    this.Glyph.Radius = 2;
    this.Glyph.FillColor = color;
    this.Glyph.OutlineColor = [0,0,0];

    this.Text = new Text();
    this.Text.Anchor = [-55,23];
    this.Text.Size = 40;
    this.Text.Color = color;
    this.Text.Position = location;
    this.Text.String = string;

    this.Arrow = new Arrow();
    this.Arrow.Origin = location;
    this.Arrow.FillColor = color;
    this.Arrow.OutlineColor = [0.0, 0.0, 0.0];
    this.Arrow.Length = 50;
    this.Arrow.width = 8;
};

Annotation.prototype.Draw = function(viewer) {
    if (viewer.MainView.Camera.Height > 10000) {
	this.Glyph.Draw(viewer.MainView);
    } else {
	this.Text.Draw(viewer.MainView);
	this.Arrow.Draw(viewer.MainView);
    }

    this.Glyph.Draw(viewer.OverView);
}
