import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { NavLink } from "react-router-dom"
import type { BreadcrumbLinkComponent } from "../types/PropTypes"

function BreadcrumbLinkComponent({
  pages,
  currentPage,
}: BreadcrumbLinkComponent) {
  return (
    <Breadcrumb className="">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <NavLink to="/" className="lg:text-md text-xs md:text-sm">
                Home
              </NavLink>
            }
          />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {pages?.map((page) => (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <NavLink
                    to={page.link}
                    className="lg:text-md text-xs md:text-sm"
                  >
                    {page.pageName}
                  </NavLink>
                }
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage className="lg:text-md text-xs md:text-sm">
            {currentPage}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbLinkComponent
