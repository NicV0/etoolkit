export function hasConflict(localVersion: number|undefined, remoteVersion: number|undefined) {
  if (localVersion==null || remoteVersion==null) return false;
  return localVersion < remoteVersion; // server is newer than what we edited
}
