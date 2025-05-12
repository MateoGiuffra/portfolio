import './App.css'
// components
import Button from './components/Button'
import PageSection from './components/PageSection'
import NavBar from './components/NavBar'
import TechnologieCard from './components/TechnologieCard'
import ProyectCard from './components/ProyectCard'
import Form from './components/Form'
import Icon from './components/Icon'
// data
import { technologies } from './data/technologies'
import { proyects } from './data/proyects'

function App() {
  return (
    <>
      <div className="background">
        <div className="curve"></div>
        <NavBar />
        <div className="app-container">
          <div className="app-wrapper">
            <section id="mateo-giuffra" className="section-app">
              <div className="info-container">
                <h1>Hi, I'am Web Full Stack Developer</h1>
                <p className="paragraph">
                  University programming student,
                  Spring Boot and React developer with a passion for learning and exploring new technologies.
                  <br />
                  I am a proactive person who enjoys working in a team and is always looking for new
                  challenges.
                </p>
                <div className="button-container">
                  <Button externalPage={false} goTo="#contact">Contact Me</Button>
                  <Button backgroud='white' goTo="files/CV-MateoGiuffra.pdf" download={true}>Download Resume</Button>
                  <Icon goTo="https://github.com/MateoGiuffra?tab=repositories" src="icons/github.svg" alt="github"></Icon>
                  <Icon goTo="https://www.linkedin.com/in/mateo-giuffra-023682289/" src="icons/linkedin.svg" alt="linkedin"></Icon>
                </div>
                <div className="dots"></div>
              </div>
            </section>
            <PageSection title="Technologies" sectionId="technologies">
              <div className="technologies-container">
                {technologies.map((technology) => (
                  <TechnologieCard
                    key={technology.title}
                    title={technology.title}
                    src={technology.src}

                  >
                    {technology.name}
                  </TechnologieCard>
                ))}
              </div>
            </PageSection>
            <PageSection sectionId="projects" title="Projects">
              <div className="projects-container">
                {proyects.map((proyect) => (
                  <div className='proyect-individual-card' key={proyect.title}>
                    <ProyectCard
                      key={proyect.title}
                      src={proyect.src}
                      tags={proyect.tags}
                      linkToGithub={proyect.linkToGithub}
                      description={proyect.description}
                      moreInfo={proyect.moreInfo}
                    >
                      {proyect.title}
                    </ProyectCard>
                  </div>
                ))}
              </div>
            </PageSection>
            <PageSection title="Contact Me" sectionId="contact">
              <div className="contact-container">
                <Form />
                <div className='contact-info'>
                  <div className='contact-info-container'>
                    <h3>Connect with me</h3>
                    <p className='free-feel'>Feel free to connect with me on any of these platforms</p>
                    <ul className='contact-info-list'>
                      <li>
                        <a className="anchor-contact" href="https://www.linkedin.com/in/mateo-giuffra-023682289/" target="_blank" rel="noreferrer">
                          <div>
                            <Icon src="icons/linkedin.svg" alt="linkedin" />
                            <p className='anchor-text'>LinkedIn</p>
                          </div>
                          <p className='anchor-sub-text'>/in/mateo-giuffra</p>
                        </a>
                      </li>
                      <li>
                        <a className="anchor-contact" href="https://www.github.com/GiuffraMateo" target="_blank" rel="noreferrer">
                          <div>
                            <Icon src="icons/github.svg" alt="GitHub" />
                            <p className='anchor-text'>GitHub</p>
                          </div>
                          <p className='anchor-sub-text'>/MateoGiuffra</p>
                        </a>
                      </li>
                    </ul>
                    <div className='contact-info-email'>
                      <p>Prefer email? Reach out directly at:</p>
                      <a
                        href='https://mail.google.com/mail/u/0/#inbox'
                        className='email'
                        target="_blank"
                        rel="noreferrer"
                      >
                        matteogiuffrah40@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </PageSection>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
