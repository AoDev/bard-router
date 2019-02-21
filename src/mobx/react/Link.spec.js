import {Link} from './Link' // Named export is the bare component, without observer or inject
import React from 'react'
import {shallow} from 'enzyme'

const routerMock = {
  route: '/',
  params: {},
  goTo: jest.fn(),
  paramMatch: jest.fn(),
}

describe('<Link/>', () => {
  it('should create a link element', () => {
    const wrapper = shallow(<Link to="/some/route" router={routerMock}/>)
    const linkElement = wrapper.find('a')
    expect(linkElement).toHaveLength(1)
  })

  describe('the "active" property', () => {
    it('should add the "active" css class when true', () => {
      const wrapper = shallow(<Link to="/some/route" className="link" active router={routerMock}/>)
      const linkElement = wrapper.find('a')
      expect(linkElement.prop('className')).toBe('link active')
    })

    it('should NOT add the "active" css class when false or when undefined', () => {
      let wrapper = shallow(<Link to="/some/route" className="link" active={false} router={routerMock}/>)
      let linkElement = wrapper.find('a')
      expect(linkElement.prop('className')).toBe('link')

      wrapper = shallow(<Link to="/some/route" className="link" router={routerMock}/>)
      linkElement = wrapper.find('a')
      expect(linkElement.prop('className')).toBe('link')
    })
  })

  describe('the "autoActive" property', () => {
    it('should add the "active" css class when the router active route matches the link route', () => {
      routerMock.paramMatch.mockImplementation(() => true)
      routerMock.route = '/some/route'
      const wrapper = shallow(<Link to="/some/route" className="link" autoActive router={routerMock}/>)
      const linkElement = wrapper.find('a')
      expect(linkElement.prop('className')).toBe('link active')
    })

    it.skip('should add the "active" css class when the params match entirely or partially the router params', () => {
      // TODO
    })
  })

  describe('clicking the link', () => {
    it('should call the router.goTo method with the link route and params', () => {
      const props = {to: '/some/route', params: {}}
      const wrapper = shallow(<Link {...props} className="link" router={routerMock}/>)
      const dummyEvent = {
        preventDefault () {},
      }
      wrapper.simulate('click', dummyEvent)
      expect(routerMock.goTo).toHaveBeenCalledWith({route: props.to, params: props.params})
    })
  })
})
