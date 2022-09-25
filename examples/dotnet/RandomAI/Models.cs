using System.Text.Json.Serialization;

public class Actions
{
}

public class Event
{
  [JsonPropertyName("type")]
  public string Type { get; set; }

  [JsonPropertyName("nick")]
  public string Nick { get; set; }

  [JsonPropertyName("coordinates")]
  public List<int> Coordinates { get; set; }

  [JsonPropertyName("start")]
  public List<int> Start { get; set; }

  [JsonPropertyName("end")]
  public List<int> End { get; set; }
}

public class Grid
{
  [JsonPropertyName("coordinates")]
  public List<int> Coordinates { get; set; }

  [JsonPropertyName("cartesian")]
  public List<double> Cartesian { get; set; }

  [JsonPropertyName("noise")]
  public double Noise { get; set; }

  [JsonPropertyName("terrain")]
  public string Terrain { get; set; }
}

public class Player
{
  [JsonPropertyName("url")]
  public string Url { get; set; }

  [JsonPropertyName("nick")]
  public string Nick { get; set; }

  [JsonPropertyName("hitpoints")]
  public int Hitpoints { get; set; }

  [JsonPropertyName("coordinates")]
  public List<int> Coordinates { get; set; }

  [JsonPropertyName("actions")]
  public Actions Actions { get; set; }

  [JsonPropertyName("mines")]
  public int Mines { get; set; }

  [JsonPropertyName("score")]
  public int Score { get; set; }
}

public class GameState
{
  [JsonPropertyName("status")]
  public string Status { get; set; }

  [JsonPropertyName("round")]
  public int Round { get; set; }

  [JsonPropertyName("grid")]
  public List<Grid> Grid { get; set; }

  [JsonPropertyName("players")]
  public List<Player> Players { get; set; }

  [JsonPropertyName("events")]
  public List<Event> Events { get; set; }
}