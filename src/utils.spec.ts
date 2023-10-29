import {splitPath, diffPaths} from './utils'

describe('utils', () => {
  describe('splitPath()', () => {
    it('should split the path', () => {
      const testPath = '/private/mystuff/details'
      const expected = ['/', '/private', '/private/mystuff', '/private/mystuff/details']
      expect(splitPath(testPath)).toEqual(expected)
    })

    it('should split correctly when it is only the root request', () => {
      // This test is there because a bug was found and caused an infinite loop
      const testPath = '/'
      const expected = ['/']
      expect(splitPath(testPath)).toEqual(expected)
    })
  })

  describe('diffPaths', () => {
    it('should return the path difference', () => {
      const testPath1 = ['/', '/a', '/a/b', '/a/b/c']
      const testPath2 = ['/', '/a', '/a/y', '/a/y/z']
      const testPath3 = ['/']
      expect(diffPaths(testPath1, testPath2)).toEqual(['/a/y', '/a/y/z'])
      expect(diffPaths(testPath1, testPath3)).toEqual([])
      expect(diffPaths(testPath1, testPath1)).toEqual([])
    })
  })
})
