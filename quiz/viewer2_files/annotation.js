
function Annotation(location, string, color) {
    this.Arrow = new Arrow();
    this.Arrow.Origin = location;
    this.Arrow.SetFillColor(color);
    this.Arrow.OutlineColor = [0.0, 0.0, 0.0];
    this.Arrow.Length = 50;
    this.Arrow.width = 8;

    this.Text = new Text();
    this.Text.Anchor = [-55,23];
    this.Text.Size = 30;
    this.Text.Color = this.Arrow.FillColor;
    this.Text.Position = location;
    this.Text.String = string;

    this.Glyph = new Circle();
    this.Glyph.Center = location;
    this.Glyph.Radius = 4;
    this.Glyph.FillColor = this.Arrow.FillColor;
    this.Glyph.OutlineColor = [0,0,0];
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
