import { NextPage } from 'next'
import firebase from 'firebase'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { auth, db } from '~/utils/firebase'
import { ProtectRoute } from '~/src/components/auth/ProtectRoute'
import { IOKR } from '~/interfaces'

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
            {props.okrs.map((okr: IOKR) => (
              <tr key={okr.id}>
                <td>{okr.owner?.name}</td>
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
  const okrs: IOKR[] = await new Promise((resolve, reject) => {
    db.collection('okrs')
      .get()
      .then(async (snapshot) => {
        const snapshots: firebase.firestore.DocumentData[] = []
        snapshot.forEach((doc) => {
          snapshots.push(doc.data())
        })
        const okrs: IOKR[] = []
        for (const i in snapshots) {
          okrs.push({
            id: snapshots[i].id,
            objective: snapshots[i].objective,
            key_results: snapshots[i].key_results,
            owner: {
              name: (await snapshots[i].owner.get()).get('name'),
            },
          })
        }
        resolve(okrs)
      })
      .catch((error) => {
        console.error(error)
        reject([])
      })
  })
  return { okrs }
}

export default Home
