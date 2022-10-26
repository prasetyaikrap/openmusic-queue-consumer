import pkg from "pg";

export default class PlaylistsService {
  constructor() {
    this._pool = new pkg.Pool();
  }

  async getPlaylist(playlistId, userId) {
    const query = {
      text: `SELECT p.id, p.name
      FROM playlists p 
      JOIN users u ON p.owner = u.id
      LEFT JOIN collaborations cb ON p.id = cb.playlist_id 
      WHERE p.id = $1 AND (p.owner = $2 OR cb.user_id = $2) `,
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError("Record not found");
    }
    const songs = await this.getSongsFromPlaylist(playlistId);
    result.rows[0].songs = songs;
    return result.rows[0];
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT s.id, s.title, s.performer
      FROM playlists p
      JOIN playlist_songs ps ON p.id = ps.playlist_id
      JOIN songs s ON ps.song_id = s.id
      WHERE p.id = $1
      ORDER BY s.updated_at DESC`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}
