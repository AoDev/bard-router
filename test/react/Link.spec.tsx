import '@testing-library/jest-dom'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RouterMock from '../../test/RouterMock'
import {Link} from '../../src/react/Link' // Named export is the bare component, without observer or inject

describe('<Link/>', () => {
  let router: RouterMock

  beforeEach(() => {
    router = new RouterMock()
  })

  it('should create a link element with the right attributes', () => {
    const wrapper = render(
      <Link to="/some/route" router={router} className="testclass">
        My link
      </Link>
    )
    const linkElement = wrapper.getByRole('link')
    expect(linkElement.getAttribute('href')).toBe('/some/route')
    expect(linkElement.getAttribute('class')).toBe('testclass')
    expect(linkElement.textContent).toBe('My link')
  })

  describe('the "active" property', () => {
    it('should add the "active" css class when true and preserve any additional class', () => {
      render(<Link to="/some/route" className="link" active router={router} />)

      const linkElement = screen.getByRole('link')
      expect(linkElement.getAttribute('class')).toBe('link active')
    })
    it('should NOT add the "active" css class when false or when undefined', () => {
      render(<Link to="/some/route" className="link" router={router} />)
      render(<Link to="/some/route" className="link" active={false} router={router} />)

      const links = screen.getAllByRole('link')
      links.forEach((link) => expect(link.getAttribute('class')).toBe('link'))
    })
  })

  describe('the "autoActive" property', () => {
    it('should add the "active" css class when the router active route matches the link route', () => {
      router.paramMatch.mockImplementation(() => true)
      router.route = '/some/route'
      render(
        <Link to="/some/route" className="link" autoActive router={router}>
          Matching
        </Link>
      )
      render(
        <Link to="/some/other-route" className="link" autoActive router={router}>
          Not Matching
        </Link>
      )

      const matchingLink = screen.getByText('Matching')
      const notMatchingLink = screen.getByText('Not Matching')

      expect(matchingLink.getAttribute('class')).toBe('link active')
      expect(notMatchingLink.getAttribute('class')).toBe('link')
    })
    // it.skip('should add the "active" css class when the params match entirely or partially the router params', () => {
    //   // TODO
    // })
  })

  describe('clicking the link', () => {
    it('should call the router.goTo method with the link route and params', async () => {
      const user = userEvent.setup()
      const params = {id: 1}
      render(<Link to="/some/route" className="link" router={router} params={params} />)

      await user.click(screen.getByRole('link'))

      expect(router.goTo).toHaveBeenCalledTimes(1)
      expect(router.goTo).toHaveBeenCalledWith('/some/route', params)
    })
  })
})
