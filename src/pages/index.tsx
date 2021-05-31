import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { auth, db } from '~/utils/firebase'
import { ProtectRoute } from '~/src/components/auth/ProtectRoute'

const Home: NextPage = (props: any) => {
  const router = useRouter()

  const logOut = async () => {
    try {
      await auth.signOut()
      router.push('/login')
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div>
      <ProtectRoute>
        <button onClick={logOut}>Logout</button>
        <table>
          <tbody>
            {props.okrs.map((okr) => (
              <tr key={okr.id}>
                <td>{okr.owner.name}</td>
                <td>{okr.objective}</td>
                <td>
                  <Link
                    href={{
                      pathname: '/okr/detail',
                      query: { id: okr.id },
                    }}
                  >
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ProtectRoute>
    </div>
  )
}

Home.getInitialProps = async () => {
  const result = await new Promise((resolve, reject) => {
    db.collection('okrs')
      .get()
      .then(async (snapshot) => {
        const data = []
        snapshot.forEach((doc) => {
          data.push(
            Object.assign(
              {
                id: doc.id,
              },
              doc.data(),
            ),
          )
        })
        for (const i in data) {
          data[i].owner = { name: (await data[i].owner.get()).get('name') }
        }
        resolve(data)
      })
      .catch((error) => {
        console.error(error)
        reject([])
      })
  })
  return { okrs: result }
}

export default Home
