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
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<NavLink to="/">Home</NavLink>} />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {pages?.map((page) => (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<NavLink to={page.link}>{page.pageName}</NavLink>}
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbLinkComponent
